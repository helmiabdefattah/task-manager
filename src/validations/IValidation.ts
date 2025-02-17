export interface IValidation<T> {
    validate(data: T): Promise<{ success: boolean; errors?: string[] }>;
}
