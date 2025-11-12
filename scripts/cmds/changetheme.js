module.exports = {
        config: {
                name: "changetheme",
                aliases: ["theme", "settheme"],
                version: "2.1.0",
                author: "NeoKEX",
                countDown: 5,
                role: 0,
                description: {
                        vi: "Thay đổi theme của nhóm/tin nhắn sử dụng AI",
                        en: "Change group/DM theme using AI"
                },
                category: "group",
                guide: {
                        vi: "   {pn} - Xem gợi ý theme (dark mode & light mode)\n   {pn} id - Xem ID theme hiện tại\n   {pn} <mô tả> - Thay đổi theme dựa trên mô tả của bạn\n   Ví dụ: {pn} romantic sunset\n   {pn} ocean vibes\n   {pn} birthday party\n   {pn} vibrant purple colors",
                        en: "   {pn} - View theme suggestions (dark mode & light mode)\n   {pn} id - View current theme ID\n   {pn} <description> - Change theme based on your description\n   Example: {pn} romantic sunset\n   {pn} ocean vibes\n   {pn} birthday party\n   {pn} vibrant purple colors"
                }
        },

        langs: {
                vi: {
                        thinking: "◈ Đang tạo theme AI dựa trên mô tả của bạn...",
                        success: "◆ Đã thay đổi theme thành công!\n◈ Tên theme: %1\n◈ Mô tả: %2",
                        error: "◆ Đã xảy ra lỗi khi thay đổi theme: %1",
                        notGroup: "Lệnh này chỉ có thể sử dụng trong nhóm hoặc tin nhắn riêng",
                        noPermission: "Bot không có quyền thay đổi theme trong nhóm này",
                        noThemes: "◆ Không thể tạo theme với mô tả này. Vui lòng thử mô tả khác!",
                        featureUnavailable: "◆ Tính năng tạo theme AI không khả dụng cho tài khoản này.\n◈ Đây là hạn chế từ Facebook dựa trên khu vực/quyền tài khoản của bạn.\n◈ Bạn vẫn có thể sử dụng các theme tiêu chuẩn có sẵn!",
                        currentThemeId: "◆ ID Theme hiện tại\n◈ Thread: %1\n◈ Theme ID: %2\n◈ Màu: %3",
                        themeSuggestions: "◆ Gợi ý Theme\n\n🌙 DARK MODE:\n◈ %1\n◈ ID: %2\n\n☀️ LIGHT MODE:\n◈ %3\n◈ ID: %4\n\n💡 Sử dụng AI: {pn} <mô tả>"
                },
                en: {
                        thinking: "◈ Creating AI theme based on your description...",
                        success: "◆ Theme changed successfully!\n◈ Theme name: %1\n◈ Description: %2",
                        error: "◆ An error occurred while changing theme: %1",
                        notGroup: "This command can only be used in groups or DMs",
                        noPermission: "Bot doesn't have permission to change theme in this group",
                        noThemes: "◆ Could not create a theme with this description. Please try a different description!",
                        featureUnavailable: "◆ AI theme generation is not available for this account.\n◈ This is a Facebook restriction based on your account's region/permissions.\n◈ You can still use all standard themes!",
                        currentThemeId: "◆ Current Theme ID\n◈ Thread: %1\n◈ Theme ID: %2\n◈ Color: %3",
                        themeSuggestions: "◆ Theme Suggestions\n\n🌙 DARK MODE:\n◈ %1\n◈ ID: %2\n\n☀️ LIGHT MODE:\n◈ %3\n◈ ID: %4\n\n💡 Use AI: {pn} <description>"
                }
        },

        onStart: async function ({ args, message, event, api, getLang }) {
                const { threadID } = event;

                // Case 1: Show current theme ID
                if (args[0] && args[0].toLowerCase() === "id") {
                        try {
                                const themeInfo = await api.getThemeInfo(threadID);
                                return message.reply(getLang("currentThemeId", 
                                        themeInfo.threadName || "This thread",
                                        themeInfo.theme_id || "Default",
                                        themeInfo.color || "N/A"
                                ));
                        } catch (error) {
                                return message.reply(getLang("error", error.message));
                        }
                }

                // Case 2: Show theme suggestions (dark & light mode)
                if (args.length === 0) {
                        try {
                                const allThemes = await api.getTheme(threadID);
                                
                                if (!Array.isArray(allThemes) || allThemes.length === 0) {
                                        return message.reply(getLang("error", "Unable to fetch available themes"));
                                }
                                
                                // Find a dark mode theme
                                const darkTheme = allThemes.find(t => 
                                        t.name && (t.name.toLowerCase().includes("dark") || 
                                        t.name.toLowerCase().includes("black") ||
                                        t.name.toLowerCase().includes("midnight"))
                                ) || allThemes.find(t => t.id === "283865976433569"); // Fallback to a known dark theme
                                
                                // Find a light mode theme  
                                const lightTheme = allThemes.find(t => 
                                        t.name && (t.name.toLowerCase().includes("light") || 
                                        t.name.toLowerCase().includes("white") ||
                                        t.name.toLowerCase().includes("bright"))
                                ) || allThemes.find(t => t.id === "1652456634878319"); // Fallback to a known light theme
                                
                                return message.reply(getLang("themeSuggestions",
                                        darkTheme?.name || "Dark Mode",
                                        darkTheme?.id || "283865976433569",
                                        lightTheme?.name || "Light Mode", 
                                        lightTheme?.id || "1652456634878319"
                                ));
                        } catch (error) {
                                return message.reply(getLang("error", error.message));
                        }
                }

                // Case 3: AI theme generation
                const userPrompt = args.join(" ");
                const thinkingMsg = await message.reply(getLang("thinking"));

                try {
                        const themes = await api.createAITheme(userPrompt);

                        if (!themes || themes.length === 0) {
                                try {
                                        await message.unsend(thinkingMsg.messageID);
                                } catch (e) {}
                                return message.reply(getLang("noThemes"));
                        }

                        const selectedTheme = themes[0];

                        await api.setThreadThemeMqtt(threadID, selectedTheme.id);
                        
                        try {
                                await message.unsend(thinkingMsg.messageID);
                        } catch (e) {}
                        
                        return message.reply(getLang("success", 
                                selectedTheme.accessibility_label || selectedTheme.name || "Custom AI Theme", 
                                userPrompt
                        ));

                } catch (error) {
                        try {
                                await message.unsend(thinkingMsg.messageID);
                        } catch (e) {}
                        
                        if (error.code === 'FEATURE_UNAVAILABLE') {
                                return message.reply(getLang("featureUnavailable"));
                        }
                        
                        return message.reply(getLang("error", error.message));
                }
        }
};
