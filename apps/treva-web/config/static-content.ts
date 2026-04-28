export const staticContent = {
    az: {
        nav: ["Ana səhifə", "Haqqımızda", "Xidmətlər", "Əlaqə"],
        heroTag: "Statik Frontend Mərhələsi",
        heroTitle: "Treva üçün sürətli, təmiz və genişlənən vitrin qatı",
        heroText:
            "İlk mərhələdə məqsədimiz backend-dən asılı olmayan, locale əsaslı və rahat genişlənən frontend skeleti qurmaqdır.",
        primaryCta: "Layihəyə bax",
        secondaryCta: "Ətraflı oxu",
        statLabel: "Hazır locale",
        statValue: "3 dil",
        sections: [
            {
                title: "Struktur",
                text: "Page axını `app/[locale]` üzərində saxlanılır və bütün statik ekranlar bu strukturdan idarə olunur.",
            },
            {
                title: "Dizayn",
                text: "UI komponentləri paylaşılmış qatdadır və sonrakı mərhələdə real data gələndə yenidən istifadə ediləcək.",
            },
            {
                title: "Hazırlıq",
                text: "Bu mərhələ vizual əsasları, naviqasiyanı və locale davranışını sabitləşdirir.",
            },
        ],
    },
    en: {
        nav: ["Home", "About", "Services", "Contact"],
        heroTag: "Static Frontend Phase",
        heroTitle: "A fast, clean, and scalable storefront layer for Treva",
        heroText:
            "In the first phase, our goal is to build a locale-based frontend shell that stays independent from backend integration.",
        primaryCta: "View project",
        secondaryCta: "Learn more",
        statLabel: "Ready locales",
        statValue: "3 languages",
        sections: [
            {
                title: "Structure",
                text: "The page flow stays on `app/[locale]` and all static screens are driven from that route model.",
            },
            {
                title: "Design",
                text: "UI components live in the shared layer and can be reused later when real data is connected.",
            },
            {
                title: "Readiness",
                text: "This phase stabilizes the visual foundation, navigation, and locale behavior.",
            },
        ],
    },
    ru: {
        nav: ["Главная", "О нас", "Услуги", "Контакт"],
        heroTag: "Этап Статического Frontend",
        heroTitle: "Быстрый, чистый и масштабируемый витринный слой для Treva",
        heroText:
            "На первом этапе наша цель построить frontend-оболочку с поддержкой locale без зависимости от backend-интеграции.",
        primaryCta: "Открыть проект",
        secondaryCta: "Подробнее",
        statLabel: "Готовые языки",
        statValue: "3 языка",
        sections: [
            {
                title: "Структура",
                text: "Маршрут `app/[locale]` сохраняется, и все статические экраны управляются через эту модель.",
            },
            {
                title: "Дизайн",
                text: "UI-компоненты находятся в общем слое и позже будут повторно использованы с реальными данными.",
            },
            {
                title: "Готовность",
                text: "Этот этап стабилизирует визуальную основу, навигацию и логику locale.",
            },
        ],
    },
} as const;
