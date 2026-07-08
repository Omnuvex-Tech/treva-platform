import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMessageCenter } from "../components/MessageCenter";
import { getApiErrorMessage } from "../utils/apiError";

interface CrudMessages<TItem> {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
    duplicateSuccess?: string;
    createError?: string;
    updateError?: string;
    deleteError?: string;
    duplicateError?: string;
}

interface UseEntityCrudOptions<TQueryData, TItem, TForm, TPayload> {
    queryKey: readonly unknown[];
    queryFn: () => Promise<TQueryData>;
    getItems: (data: TQueryData | undefined) => TItem[];
    createEmptyForm: () => TForm;
    mapItemToForm: (item: TItem) => TForm;
    buildPayload: (form: TForm) => TPayload;
    createFn: (payload: TPayload) => Promise<unknown>;
    updateFn: (id: string, payload: TPayload) => Promise<unknown>;
    deleteFn: (id: string) => Promise<unknown>;
    getItemId: (item: TItem) => string;
    getDeleteLabel?: (item: TItem) => string;
    buildDuplicatePayload?: (item: TItem) => TPayload;
    entityName?: string;
    messages?: CrudMessages<TItem>;
}

export function useEntityCrud<TQueryData, TItem, TForm, TPayload>({
    queryKey,
    queryFn,
    getItems,
    createEmptyForm,
    mapItemToForm,
    buildPayload,
    createFn,
    updateFn,
    deleteFn,
    getItemId,
    getDeleteLabel,
    buildDuplicatePayload,
    entityName = "Item",
    messages,
}: UseEntityCrudOptions<TQueryData, TItem, TForm, TPayload>) {
    const queryClient = useQueryClient();
    const { showError, showSuccess } = useMessageCenter();
    const [showForm, setShowForm] = useState(false);
    const [editItem, setEditItem] = useState<TItem | null>(null);
    const [form, setForm] = useState<TForm>(() => createEmptyForm());

    const { data, isLoading } = useQuery({
        queryKey: [...queryKey],
        queryFn,
    });

    const items = getItems(data);

    const resetForm = () => setForm(createEmptyForm());

    const closeForm = () => {
        setShowForm(false);
        setEditItem(null);
        resetForm();
    };

    const invalidateList = () =>
        queryClient.invalidateQueries({ queryKey: [...queryKey] });

    const createMutation = useMutation({
        mutationFn: (nextForm: TForm) => createFn(buildPayload(nextForm)),
        onSuccess: () => {
            invalidateList();
            closeForm();
            showSuccess({
                title: messages?.createSuccess ?? `${entityName} created`,
            });
        },
        onError: (error) => {
            showError({
                title: messages?.createError ?? `${entityName} could not be created`,
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            nextForm,
        }: {
            id: string;
            nextForm: TForm;
        }) => updateFn(id, buildPayload(nextForm)),
        onSuccess: () => {
            invalidateList();
            closeForm();
            showSuccess({
                title: messages?.updateSuccess ?? `${entityName} updated`,
            });
        },
        onError: (error) => {
            showError({
                title: messages?.updateError ?? `${entityName} could not be updated`,
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteFn(id),
        onSuccess: () => {
            invalidateList();
            showSuccess({
                title: messages?.deleteSuccess ?? `${entityName} deleted`,
            });
        },
        onError: (error) => {
            showError({
                title: messages?.deleteError ?? `${entityName} could not be deleted`,
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const duplicateMutation = useMutation({
        mutationFn: (item: TItem) => {
            if (!buildDuplicatePayload) {
                throw new Error("Duplicate payload builder is not configured.");
            }

            return createFn(buildDuplicatePayload(item));
        },
        onSuccess: () => {
            invalidateList();
            showSuccess({
                title: messages?.duplicateSuccess ?? `${entityName} duplicated`,
            });
        },
        onError: (error) => {
            showError({
                title: messages?.duplicateError ?? `${entityName} could not be duplicated`,
                description: getApiErrorMessage(error, "Please try again."),
            });
        },
    });

    const openCreate = () => {
        resetForm();
        setEditItem(null);
        setShowForm(true);
    };

    const openEdit = (item: TItem) => {
        setForm(mapItemToForm(item));
        setEditItem(item);
        setShowForm(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            updateMutation.mutate({
                id: getItemId(editItem),
                nextForm: form,
            });
            return;
        }

        createMutation.mutate(form);
    };

    const confirmAndDelete = (item: TItem) => {
        const label = getDeleteLabel?.(item) ?? "this item";
        if (window.confirm(`Delete "${label}"?`)) {
            deleteMutation.mutate(getItemId(item));
        }
    };

    const duplicateItem = buildDuplicatePayload
        ? (item: TItem) => {
              duplicateMutation.mutate(item);
          }
        : undefined;

    return {
        items,
        isLoading,
        showForm,
        form,
        setForm,
        editItem,
        openCreate,
        openEdit,
        closeForm,
        submitForm,
        confirmAndDelete,
        duplicateItem,
        createMutation,
        updateMutation,
        deleteMutation,
        duplicateMutation,
    };
}
