import { z } from "zod";
import type { TrelloEnv, TrelloClient } from "../trello.js";
import { jsonText } from "./codec.js";

export type ToolContext = {
  env: TrelloEnv;
  trello: TrelloClient;
};

export type ToolHandler = (args: Record<string, unknown>, ctx: ToolContext) => Promise<ReturnType<typeof jsonText>>;

export const HANDLERS: Record<string, ToolHandler> = {
  async trello_list_boards(_args, { trello }) {
    const boards = await trello.getJson<unknown[]>("/members/me/boards", {
      fields: "name,url,closed,dateLastActivity",
    });
    return jsonText(boards);
  },

  async trello_list_lists(args, { env, trello }) {
    const input = z.object({ boardId: z.string().optional() }).parse(args);
    const boardId = input.boardId ?? env.TRELLO_DEFAULT_BOARD_ID;
    if (!boardId) throw new Error("Missing boardId (or set TRELLO_DEFAULT_BOARD_ID).");
    const lists = await trello.getJson<unknown[]>(`/boards/${boardId}/lists`, { fields: "name,closed,pos" });
    return jsonText(lists);
  },

  async trello_list_cards(args, { env, trello }) {
    const input = z.object({ listId: z.string().optional() }).parse(args);
    const listId = input.listId ?? env.TRELLO_DEFAULT_LIST_ID;
    if (!listId) throw new Error("Missing listId (or set TRELLO_DEFAULT_LIST_ID).");
    const cards = await trello.getJson<unknown[]>(`/lists/${listId}/cards`, {
      fields: "name,url,desc,due,idList,idBoard,dateLastActivity,closed,labels",
    });
    return jsonText(cards);
  },

  async trello_get_card(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1) }).parse(args);
    const card = await trello.getJson<unknown>(`/cards/${input.cardId}`, {
      fields: "name,url,desc,due,idList,idBoard,dateLastActivity,closed,labels,idMembers",
      actions: "commentCard",
      action_fields: "type,date,data,memberCreator",
      action_limit: "20",
    });
    return jsonText(card);
  },

  async trello_create_card(args, { env, trello }) {
    const input = z
      .object({
        listId: z.string().optional(),
        name: z.string().min(1),
        desc: z.string().optional(),
        due: z.string().optional(),
        idMembers: z.array(z.string().min(1)).optional(),
      })
      .parse(args);

    const listId = input.listId ?? env.TRELLO_DEFAULT_LIST_ID;
    if (!listId) throw new Error("Missing listId (or set TRELLO_DEFAULT_LIST_ID).");

    const card = await trello.postForm<unknown>("/cards", {
      idList: listId,
      name: input.name,
      desc: input.desc,
      due: input.due,
      idMembers: input.idMembers?.join(","),
    });
    return jsonText(card);
  },

  async trello_move_card(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), listId: z.string().min(1) }).parse(args);
    const card = await trello.postForm<unknown>(`/cards/${input.cardId}`, { idList: input.listId });
    return jsonText(card);
  },

  async trello_add_comment(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), text: z.string().min(1) }).parse(args);
    const action = await trello.postForm<unknown>(`/cards/${input.cardId}/actions/comments`, { text: input.text });
    return jsonText(action);
  },

  async trello_search_cards(args, { trello }) {
    const input = z
      .object({
        query: z.string().min(1),
        boardId: z.string().optional(),
        limit: z.number().int().positive().max(1000).optional(),
        includeClosed: z.boolean().optional(),
        raw: z.boolean().optional(),
      })
      .parse(args);

    const cards_limit = String(input.limit ?? 50);
    const result = await trello.getJson<{ cards?: unknown[] }>("/search", {
      query: input.query,
      modelTypes: "cards",
      card_fields: "name,url,desc,due,idList,idBoard,dateLastActivity,closed,labels",
      cards_limit,
      idBoards: input.boardId,
      card_closed: input.includeClosed ? "true" : undefined,
    });

    if (input.raw) return jsonText(result);
    return jsonText(result.cards ?? []);
  },

  async trello_update_card(args, { trello }) {
    const input = z
      .object({
        cardId: z.string().min(1),
        name: z.string().optional(),
        desc: z.string().optional(),
        due: z.union([z.string(), z.null()]).optional(),
        idMembers: z.array(z.string().min(1)).optional(),
        idLabels: z.array(z.string().min(1)).optional(),
        closed: z.boolean().optional(),
      })
      .parse(args);

    const updated = await trello.requestJson<unknown>({
      method: "PUT",
      path: `/cards/${input.cardId}`,
      bodyType: "form",
      body: {
        name: input.name,
        desc: input.desc,
        due: input.due === null ? "" : input.due,
        idMembers: input.idMembers?.join(","),
        idLabels: input.idLabels?.join(","),
        closed: input.closed === undefined ? undefined : String(input.closed),
      },
    });
    return jsonText(updated);
  },

  async trello_create_board(args, { trello }) {
    const input = z
      .object({
        name: z.string().min(1),
        defaultLists: z.boolean().optional(),
        desc: z.string().optional(),
      })
      .parse(args);

    const board = await trello.requestJson<unknown>({
      method: "POST",
      path: "/boards",
      bodyType: "form",
      body: {
        name: input.name,
        defaultLists: input.defaultLists === undefined ? undefined : String(input.defaultLists),
        desc: input.desc,
      },
    });

    return jsonText(board);
  },

  async trello_list_labels(args, { env, trello }) {
    const input = z.object({ boardId: z.string().optional() }).parse(args);
    const boardId = input.boardId ?? env.TRELLO_DEFAULT_BOARD_ID;
    if (!boardId) throw new Error("Missing boardId (or set TRELLO_DEFAULT_BOARD_ID).");

    const labels = await trello.getJson<unknown[]>(`/boards/${boardId}/labels`, {
      fields: "name,color",
      limit: "1000",
    });
    return jsonText(labels);
  },

  async trello_create_label(args, { env, trello }) {
    const input = z
      .object({
        boardId: z.string().optional(),
        name: z.string().optional(),
        color: z.string().min(1),
      })
      .parse(args);

    const boardId = input.boardId ?? env.TRELLO_DEFAULT_BOARD_ID;
    if (!boardId) throw new Error("Missing boardId (or set TRELLO_DEFAULT_BOARD_ID).");

    const label = await trello.requestJson<unknown>({
      method: "POST",
      path: "/labels",
      bodyType: "form",
      body: {
        idBoard: boardId,
        name: input.name,
        color: input.color,
      },
    });
    return jsonText(label);
  },

  async trello_add_label_to_card(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), labelId: z.string().min(1) }).parse(args);
    const res = await trello.requestJson<unknown>({
      method: "POST",
      path: `/cards/${input.cardId}/idLabels`,
      bodyType: "form",
      body: { value: input.labelId },
    });
    return jsonText(res);
  },

  async trello_remove_label_from_card(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), labelId: z.string().min(1) }).parse(args);
    const res = await trello.requestJson<unknown>({
      method: "DELETE",
      path: `/cards/${input.cardId}/idLabels/${input.labelId}`,
    });
    return jsonText(res);
  },

  async trello_list_board_members(args, { env, trello }) {
    const input = z.object({ boardId: z.string().optional() }).parse(args);
    const boardId = input.boardId ?? env.TRELLO_DEFAULT_BOARD_ID;
    if (!boardId) throw new Error("Missing boardId (or set TRELLO_DEFAULT_BOARD_ID).");

    const members = await trello.getJson<unknown[]>(`/boards/${boardId}/members`, {
      fields: "fullName,username",
    });
    return jsonText(members);
  },

  async trello_set_card_members(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), idMembers: z.array(z.string().min(1)) }).parse(args);
    const updated = await trello.requestJson<unknown>({
      method: "PUT",
      path: `/cards/${input.cardId}`,
      bodyType: "form",
      body: { idMembers: input.idMembers.join(",") },
    });
    return jsonText(updated);
  },

  async trello_add_card_members(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), idMembers: z.array(z.string().min(1)).min(1) }).parse(args);
    const results: unknown[] = [];
    for (const memberId of input.idMembers) {
      const res = await trello.requestJson<unknown>({
        method: "POST",
        path: `/cards/${input.cardId}/idMembers`,
        bodyType: "form",
        body: { value: memberId },
      });
      results.push(res);
    }
    return jsonText(results);
  },

  async trello_remove_card_members(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), idMembers: z.array(z.string().min(1)).min(1) }).parse(args);
    const results: unknown[] = [];
    for (const memberId of input.idMembers) {
      const res = await trello.requestJson<unknown>({
        method: "DELETE",
        path: `/cards/${input.cardId}/idMembers/${memberId}`,
      });
      results.push(res);
    }
    return jsonText(results);
  },

  async trello_add_attachment(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), url: z.string().min(1), name: z.string().optional() }).parse(args);
    const attachment = await trello.requestJson<unknown>({
      method: "POST",
      path: `/cards/${input.cardId}/attachments`,
      bodyType: "form",
      body: { url: input.url, name: input.name },
    });
    return jsonText(attachment);
  },

  async trello_create_checklist(args, { trello }) {
    const input = z.object({ cardId: z.string().min(1), name: z.string().min(1) }).parse(args);
    const checklist = await trello.requestJson<unknown>({
      method: "POST",
      path: `/cards/${input.cardId}/checklists`,
      bodyType: "form",
      body: { name: input.name },
    });
    return jsonText(checklist);
  },

  async trello_add_checklist_item(args, { trello }) {
    const input = z
      .object({
        checklistId: z.string().min(1),
        name: z.string().min(1),
        checked: z.boolean().optional(),
      })
      .parse(args);

    const item = await trello.requestJson<unknown>({
      method: "POST",
      path: `/checklists/${input.checklistId}/checkItems`,
      bodyType: "form",
      body: {
        name: input.name,
        checked: input.checked === undefined ? undefined : String(input.checked),
      },
    });
    return jsonText(item);
  },

  async trello_set_checklist_item_state(args, { trello }) {
    const input = z
      .object({
        cardId: z.string().min(1),
        checkItemId: z.string().min(1),
        state: z.enum(["complete", "incomplete"]),
      })
      .parse(args);

    const res = await trello.requestJson<unknown>({
      method: "PUT",
      path: `/cards/${input.cardId}/checkItem/${input.checkItemId}`,
      bodyType: "form",
      body: { state: input.state },
    });
    return jsonText(res);
  },

  async trello_move_card_advanced(args, { trello }) {
    const input = z
      .object({
        cardId: z.string().min(1),
        listId: z.string().optional(),
        boardId: z.string().optional(),
        pos: z.string().optional(),
      })
      .parse(args);

    if (!input.listId && !input.boardId && !input.pos) {
      throw new Error("No changes provided. Provide at least one of listId, boardId, or pos.");
    }

    const res = await trello.requestJson<unknown>({
      method: "PUT",
      path: `/cards/${input.cardId}`,
      bodyType: "form",
      body: {
        idList: input.listId,
        idBoard: input.boardId,
        pos: input.pos,
      },
    });
    return jsonText(res);
  },
};

