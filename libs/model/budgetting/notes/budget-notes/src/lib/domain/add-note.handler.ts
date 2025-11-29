import { AddNoteToBudgetCommand } from './add-note.command';

export interface ICommandHandler<TCommand, TResult = void> {
  execute(command: TCommand): Promise<TResult>;
}

export interface AddNoteToBudgetResult {
  success: boolean;
  noteId?: string;
}

export abstract class FunctionHandler<TCommand, TResult> implements ICommandHandler<TCommand, TResult> {
  abstract execute(command: TCommand): Promise<TResult>;
}

export class AddNoteToBudgetHandler extends FunctionHandler<AddNoteToBudgetCommand, AddNoteToBudgetResult> {
  async execute(command: AddNoteToBudgetCommand): Promise<AddNoteToBudgetResult> {
    const { budgetId, content, authorId } = command;

    if (!budgetId || !content?.trim() || !authorId) {
      throw new Error('Invalid command: budgetId, content, and authorId are required.');
    }

    return {
      success: true,
      noteId: 'test-note-id' + Math.random().toString(36).substr(2, 9),
    };
  }
}