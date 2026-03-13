import { Responsive, useContainerWidth } from "react-grid-layout";
import WidgetRenderer from "./WidgetRenderer";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const COLS = { lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 };
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const ROW_HEIGHT = 56;
const GRID_MARGIN = [16, 16];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const DashboardRenderer = ({ sections, dashboardData, sessionInfo }) => {
    const sortedSections = [...(sections || [])].sort(
        (a, b) => Number(a?.section_order || 0) - Number(b?.section_order || 0),
    );

    const getWidgetShellClasses = (widget) => {
        const type = widget?.widget_type?.toLowerCase();
        if (type === "card") return "h-full";
        if (type === "chart") {
            return "h-full overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm";
        }
        return "h-full overflow-hidden rounded-lg";
    };

    const { width, containerRef, mounted } = useContainerWidth({
        measureBeforeMount: false,
        initialWidth: 1280,
    });

    const buildLayouts = (widgets = []) => {
        const minY = widgets.length
            ? Math.min(...widgets.map((widget) => Number(widget?.layout?.y || 0)))
            : 0;

        const getBaseLayout = (widget, breakpointKey) => {
            const raw = widget?.layout || {};
            // Supports both: layout:{x,y,w,h} and layout:{lg:{...},md:{...},sm:{...}}
            if (raw?.[breakpointKey] && typeof raw[breakpointKey] === "object") {
                return raw[breakpointKey];
            }
            return raw;
        };

        const lg = widgets.map((widget, index) => {
            const base = getBaseLayout(widget, "lg");
            const i = String(widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`);
            const x = clamp(Number(base?.x || 0), 0, COLS.lg - 1);
            const y = Math.max(0, Number(base?.y || 0) - minY);
            const w = clamp(Number(base?.w || 1), 1, COLS.lg);
            const h = clamp(Number(base?.h || 1), 1, 24);

            return { i, x, y, w, h, static: true };
        });

        const md = widgets.map((widget, index) => {
            const i = String(widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`);
            const base = getBaseLayout(widget, "md");
            const hasBreakpointLayout =
                typeof widget?.layout?.md === "object" &&
                widget?.layout?.md !== null;
            const lgItem = lg[index];
            return {
                i,
                x: hasBreakpointLayout ? clamp(Number(base?.x || 0), 0, COLS.md - 1) : 0,
                y: hasBreakpointLayout ? Math.max(0, Number(base?.y || 0)) : index * Math.max(1, lgItem.h),
                w: hasBreakpointLayout ? clamp(Number(base?.w || 1), 1, COLS.md) : COLS.md,
                h: hasBreakpointLayout ? clamp(Number(base?.h || 1), 1, 24) : lgItem.h,
                static: true,
            };
        });

        const sm = widgets.map((widget, index) => {
            const i = String(widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`);
            const base = getBaseLayout(widget, "sm");
            const hasBreakpointLayout =
                typeof widget?.layout?.sm === "object" &&
                widget?.layout?.sm !== null;
            const lgItem = lg[index];
            return {
                i,
                x: hasBreakpointLayout ? clamp(Number(base?.x || 0), 0, COLS.sm - 1) : 0,
                y: hasBreakpointLayout ? Math.max(0, Number(base?.y || 0)) : index * Math.max(1, lgItem.h),
                w: hasBreakpointLayout ? clamp(Number(base?.w || 1), 1, COLS.sm) : COLS.sm,
                h: hasBreakpointLayout ? clamp(Number(base?.h || 1), 1, 24) : lgItem.h,
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
                                rowHeight={ROW_HEIGHT}
                                margin={GRID_MARGIN}
                                containerPadding={[0, 0]}
                                isDraggable={false}
                                isResizable={false}
                                compactType={null}
                                preventCollision={true}
                            >
                                {widgets.map((widget, index) => {
                                    const key = String(
                                        widget?.dashboard_widget_id || `${widget?.widget_key}-${index}`,
                                    );

                                    return (
                                        <div key={key} className="h-full">
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
