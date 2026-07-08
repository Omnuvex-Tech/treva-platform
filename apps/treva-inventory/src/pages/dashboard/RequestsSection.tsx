import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsApi, type Request } from "../../api/requests";
import { CrudSection } from "../../components/CrudSection";
import { useMessageCenter } from "../../components/MessageCenter";
import { getApiErrorMessage } from "../../utils/apiError";

export function RequestsSection() {
    const qc = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();

    const { data, isLoading } = useQuery({ queryKey: ["requests"], queryFn: () => requestsApi.getAll() });

    const deleteMut = useMutation({
        mutationFn: (id: string) => requestsApi.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["requests"] });
            showSuccess({ title: "Request deleted" });
        },
        onError: (error) => {
            showError({
                title: "Request could not be deleted",
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const items = Array.isArray(data?.data) ? data.data : [];

    return (
        <CrudSection
            title="Requests"
            isLoading={isLoading}
            columns={[
                { key: "fullName", label: "Full Name" },
                { key: "phone", label: "Phone" },
                { key: "date", label: "Date" },
            ]}
            items={items}
            emptyText="No requests yet"
            getRowKey={(item) => item.id}
            renderCells={(item: Request) => (
                <>
                    <td className="px-4 py-3 text-[#1A1A1A]">{item.fullName}</td>
                    <td className="px-4 py-3 text-[#666666]">{item.phoneNumber}</td>
                    <td className="px-4 py-3 text-[#666666]">{new Date(item.createdAt).toLocaleDateString()}</td>
                </>
            )}
            onDelete={(item: Request) => {
                if (window.confirm(`Delete request from "${item.fullName}"?`)) {
                    deleteMut.mutate(item.id);
                }
            }}
        />
    );
}
