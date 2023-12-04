import { TodosAccess } from "../dataLayer/todosAccess.mjs";

const todosAccess = new TodosAccess();

export async function getTodoItems(userId) {
    return await todosAccess.getTodoItems(userId);
}

export async function createTodoItem(newTodo, userId) {
    return await todosAccess.createTodoItem(newTodo, userId);
}

export async function updateTodoItem(todoId, userId, updatedTodo) {
    return await todosAccess.updateTodoItem(todoId, userId, updatedTodo);
}

export async function deleteTodoItem(todoId, userId) {
    return await todosAccess.deleteTodoItem(todoId, userId);
}

export async function generateUploadUrl(todoId, userId) {
    const attachmentUrl = await todosAccess.generateUploadUrl(todoId);
    await todosAccess.updateAttachmentUrl(todoId, userId);
    return attachmentUrl;
}