const SkeletonDashboard = () => {
    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-[120px] bg-gray-200 rounded-lg animate-pulse"
                    />
                ))}
            </div>

            <div className="mt-6 flex flex-col-reverse lg:flex-row gap-4">
                <div className="h-80 w-full lg:w-2/3 bg-gray-200 animate-pulse rounded-lg" />
                <div className="h-80 w-full lg:w-1/3 bg-gray-200 animate-pulse rounded-lg" />
            </div>
        </div>
    );
};

export default SkeletonDashboard;
