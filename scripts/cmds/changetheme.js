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
                        generatingPreviews: "◈ Đang tạo theme preview...",
                        success: "◆ Đã thay đổi theme thành công!\n◈ Tên theme: %1\n◈ Mô tả: %2",
                        error: "◆ Đã xảy ra lỗi khi thay đổi theme: %1",
                        notGroup: "Lệnh này chỉ có thể sử dụng trong nhóm hoặc tin nhắn riêng",
                        noPermission: "Bot không có quyền thay đổi theme trong nhóm này",
                        noThemes: "◆ Không thể tạo theme với mô tả này. Vui lòng thử mô tả khác!",
                        featureUnavailable: "◆ Tính năng tạo theme AI không khả dụng cho tài khoản này.\n◈ Đây là hạn chế từ Facebook dựa trên khu vực/quyền tài khoản của bạn.\n◈ Bạn vẫn có thể sử dụng các theme tiêu chuẩn có sẵn!",
                        currentThemeId: "◆ ID Theme hiện tại\n◈ Thread: %1\n◈ Theme ID: %2\n◈ Màu: %3",
                        themePreview: "◆ Theme Preview\n\n🎨 %1\n◈ ID: %2\n\n💡 Sử dụng: {pn} <mô tả AI>"
                },
                en: {
                        thinking: "◈ Creating AI theme based on your description...",
                        generatingPreviews: "◈ Generating theme previews...",
                        success: "◆ Theme changed successfully!\n◈ Theme name: %1\n◈ Description: %2",
                        error: "◆ An error occurred while changing theme: %1",
                        notGroup: "This command can only be used in groups or DMs",
                        noPermission: "Bot doesn't have permission to change theme in this group",
                        noThemes: "◆ Could not create a theme with this description. Please try a different description!",
                        featureUnavailable: "◆ AI theme generation is not available for this account.\n◈ This is a Facebook restriction based on your account's region/permissions.\n◈ You can still use all standard themes!",
                        currentThemeId: "◆ Current Theme ID\n◈ Thread: %1\n◈ Theme ID: %2\n◈ Color: %3",
                        themePreview: "◆ Theme Preview\n\n🎨 %1\n◈ ID: %2\n\n💡 Use: {pn} <AI description>"
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

                // Case 2: Show theme preview images (dark & light mode)
                if (args.length === 0) {
                        const loadingMsg = await message.reply(getLang("generatingPreviews"));
                        
                        try {
                                // Generate AI theme to get preview images
                                const themes = await api.createAITheme("elegant modern theme");
                                
                                if (!themes || themes.length === 0) {
                                        try {
                                                await message.unsend(loadingMsg.messageID);
                                        } catch (e) {}
                                        return message.reply(getLang("noThemes"));
                                }
                                
                                const theme = themes[0];
                                const imageUrls = [];
                                
                                // Get light mode preview image
                                if (theme.background_asset?.image?.uri) {
                                        imageUrls.push(theme.background_asset.image.uri);
                                } else if (theme.icon_asset?.image?.uri) {
                                        imageUrls.push(theme.icon_asset.image.uri);
                                }
                                
                                // Get dark mode preview image
                                if (theme.alternative_themes && theme.alternative_themes.length > 0) {
                                        const darkTheme = theme.alternative_themes.find(t => t.app_color_mode === "DARK");
                                        if (darkTheme?.background_asset?.image?.uri) {
                                                imageUrls.push(darkTheme.background_asset.image.uri);
                                        } else if (darkTheme?.icon_asset?.image?.uri) {
                                                imageUrls.push(darkTheme.icon_asset.image.uri);
                                        }
                                }
                                
                                try {
                                        await message.unsend(loadingMsg.messageID);
                                } catch (e) {}
                                
                                // Send ONLY images, no text
                                if (imageUrls.length > 0) {
                                        return message.reply({
                                                attachment: imageUrls
                                        });
                                } else {
                                        return message.reply(getLang("noThemes"));
                                }
                                
                        } catch (error) {
                                try {
                                        await message.unsend(loadingMsg.messageID);
                                } catch (e) {}
                                
                                if (error.code === 'FEATURE_UNAVAILABLE') {
                                        return message.reply(getLang("featureUnavailable"));
                                }
                                
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
