import { resolveWidgetComponent } from "./widgetRegistry.jsx";

const WidgetRenderer = ({ widget, data, sessionInfo }) => {

    const Component = resolveWidgetComponent(widget);

    if (!Component) {
        return (
            <div className="h-full p-3 rounded bg-red-50 text-red-700 text-sm font-medium border border-red-200">
                Widget Not Found: <span className="font-bold">{widget?.widget_key}</span>
            </div>
        );
    }

    return (
        <Component
            widget={widget}
            dashboardData={data}
            sessionInfo={sessionInfo}
            roleId={sessionInfo?.roleId}
            sortName={sessionInfo?.sortName}
        />
    );
};

export default WidgetRenderer;
