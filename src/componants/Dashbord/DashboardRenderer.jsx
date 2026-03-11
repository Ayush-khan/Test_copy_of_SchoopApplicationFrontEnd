import WidgetRenderer from "./WidgetRenderer";

const DashboardRenderer = ({ sections, dashboardData, sessionInfo }) => {
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

    return (
        <div className="space-y-6 p-4">

            {sections.map((section) => (

                <section key={section.section_id} className="space-y-3">
                    {section.section_name && (
                        <h3 className="text-sm font-semibold text-gray-600 px-1">
                            {section.section_name}
                        </h3>
                    )}

                    <div className="grid grid-cols-12 gap-4">

                        {section.widgets.map((widget) => {
                            const colSpan = Math.min(12, Math.max(1, Number(widget?.layout?.w || 12)));
                            const rowSpan = Math.max(1, Number(widget?.layout?.h || 1));
                            const minHeight = getWidgetMinHeight(widget);

                            return (
                                <div
                                    key={widget.dashboard_widget_id || widget.widget_key}
                                    className="col-span-12 lg:col-span-6 xl:col-span-4 2xl:col-span-3"
                                    style={{
                                        gridColumn: `span ${colSpan} / span ${colSpan}`,
                                        gridRow: `span ${rowSpan} / span ${rowSpan}`,
                                        minHeight,
                                    }}
                                >
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
                    </div>
                </section>

            ))}

        </div>
    );
};

export default DashboardRenderer;
