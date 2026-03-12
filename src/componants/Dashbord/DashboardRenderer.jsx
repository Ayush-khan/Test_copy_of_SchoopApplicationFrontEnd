import { Responsive, useContainerWidth } from "react-grid-layout";
import WidgetRenderer from "./WidgetRenderer";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const COLS = { lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 };
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const DashboardRenderer = ({ sections, dashboardData, sessionInfo }) => {
    const sortedSections = [...(sections || [])].sort(
        (a, b) => Number(a?.section_order || 0) - Number(b?.section_order || 0),
    );

    const getWidgetMinHeight = (widget) => {
        const type = widget?.widget_type?.toLowerCase();
        const h = Number(widget?.layout?.h || 2);

        if (type === "card") return 112;
        if (type === "chart") return Math.max(320, h * 90);
        if (type === "table") return Math.max(320, h * 90);
        return Math.max(220, h * 80);
    };

    const getWidgetShellClasses = (widget) => {
        const type = widget?.widget_type?.toLowerCase();
        if (type === "card") return "h-full";
        return "h-full bg-white border border-gray-200 rounded-lg shadow-sm p-2 sm:p-3";
    };

    const { width, containerRef, mounted } = useContainerWidth({
        measureBeforeMount: false,
        initialWidth: 1280,
    });

    const buildLayouts = (widgets = []) => {
        const minY = widgets.length
            ? Math.min(...widgets.map((widget) => Number(widget?.layout?.y || 0)))
            : 0;

        const lg = widgets.map((widget, index) => {
            const base = widget?.layout || {};
            const i = String(widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`);
            const x = clamp(Number(base?.x || 0), 0, COLS.lg - 1);
            const y = Math.max(0, Number(base?.y || 0) - minY);
            const w = clamp(Number(base?.w || 1), 1, COLS.lg);
            const h = clamp(Number(base?.h || 1), 1, 24);

            return { i, x, y, w, h, static: true };
        });

        const md = widgets.map((widget, index) => {
            const i = String(widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`);
            const lgItem = lg[index];
            return {
                i,
                x: 0,
                y: index * Math.max(1, lgItem.h),
                w: COLS.md,
                h: lgItem.h,
                static: true,
            };
        });

        const sm = widgets.map((widget, index) => {
            const i = String(widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`);
            const lgItem = lg[index];
            return {
                i,
                x: 0,
                y: index * Math.max(1, lgItem.h),
                w: COLS.sm,
                h: lgItem.h,
                static: true,
            };
        });

        return { lg, md, sm, xs: sm, xxs: sm };
    };

    return (
        <div ref={containerRef} className="space-y-6 p-4">
            {sortedSections.map((section) => {
                const widgets = [...(section?.widgets || [])].sort((a, b) => {
                    const ay = Number(a?.layout?.y || 0);
                    const by = Number(b?.layout?.y || 0);
                    if (ay !== by) return ay - by;

                    const ax = Number(a?.layout?.x || 0);
                    const bx = Number(b?.layout?.x || 0);
                    if (ax !== bx) return ax - bx;

                    return Number(a?.dashboard_widget_id || 0) - Number(b?.dashboard_widget_id || 0);
                });
                const layouts = buildLayouts(widgets);

                return (
                    <section key={section.section_id} className="space-y-3">
                        {mounted ? (
                            <Responsive
                                className="layout"
                                width={width}
                                layouts={layouts}
                                breakpoints={BREAKPOINTS}
                                cols={COLS}
                                rowHeight={56}
                                margin={[16, 16]}
                                containerPadding={[0, 0]}
                                isDraggable={false}
                                isResizable={false}
                                compactType="vertical"
                                preventCollision={false}
                            >
                                {widgets.map((widget, index) => {
                                    const key = String(
                                        widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`,
                                    );
                                    const minHeight = getWidgetMinHeight(widget);

                                    return (
                                        <div key={key} style={{ minHeight }}>
                                            <div className={`w-full rounded-lg ${getWidgetShellClasses(widget)}`}>
                                                <WidgetRenderer
                                                    widget={widget}
                                                    data={dashboardData}
                                                    sessionInfo={sessionInfo}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </Responsive>
                        ) : (
                            <div className="h-24 rounded-lg bg-gray-100 animate-pulse" />
                        )}
                    </section>
                );
            })}
        </div>
    );
};

export default DashboardRenderer;
