
interface Proms{
    params: Promise<{
        projectId: string;
    }>
};

const Page = async({params}: Proms) =>{
    const { projectId } = await params;
    return (
        <div className="p-4 max-w-7xl mx-auto">
            Project ID: {projectId}
        </div>
    );
}

export default Page;