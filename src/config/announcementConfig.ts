import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题，留空则走i18n默认标题
	title: "欢迎",

	// 公告内容
	content:
		"这个博客用来记录我的学习过程：AI 与机器学习、编程语言、嵌入式开发，以及读书和课程笔记。内容会持续补充，欢迎交流。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "从这篇文章开始了解本站",
		// 链接 URL
		url: "/posts/hello-world/",
		// 内部链接
		external: false,
	},
};
