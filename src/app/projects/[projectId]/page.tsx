import ProjectView from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Proms{
    params: Promise<{
        projectId: string;
    }>
};

const Page = async({params}: Proms) =>{
    const { projectId } = await params;

    const queryClient = getQueryClient();

    void queryClient.prefetchQuery(trpc.messages.getMany.
        queryOptions({
            projectId,
        }));

    void queryClient.prefetchQuery(trpc.projects.getOne.
        queryOptions({
            id: projectId,
        }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ErrorBoundary fallback={<p>Something went wrong loading the project.</p>}>
                <Suspense fallback={<p>Loading...</p>}>
                <ProjectView projectId={projectId}></ProjectView>
                </Suspense>
            </ErrorBoundary>
        </HydrationBoundary>
    );
}

export default Page;