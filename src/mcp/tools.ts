export type McpToolDef = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

export const TOOLS: McpToolDef[] = [
  {
    name: "trello_list_boards",
    description: "List boards for the authenticated Trello user.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "trello_list_lists",
    description: "List lists in a board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "string", description: "Trello board id (optional if TRELLO_DEFAULT_BOARD_ID is set)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "trello_list_cards",
    description: "List cards in a list.",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "string", description: "Trello list id (optional if TRELLO_DEFAULT_LIST_ID is set)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "trello_get_card",
    description: "Get details for a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
      },
      required: ["cardId"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_create_card",
    description: "Create a card in a list.",
    inputSchema: {
      type: "object",
      properties: {
        listId: { type: "string", description: "Trello list id (optional if TRELLO_DEFAULT_LIST_ID is set)." },
        name: { type: "string", description: "Card title." },
        desc: { type: "string", description: "Card description (markdown supported)." },
        due: { type: "string", description: "Due date ISO string (e.g. 2026-04-20T12:00:00Z)." },
        idMembers: { type: "array", items: { type: "string" }, description: "Member ids to assign." },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_move_card",
    description: "Move a card to another list.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        listId: { type: "string", description: "Destination list id." },
      },
      required: ["cardId", "listId"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_add_comment",
    description: "Add a comment to a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        text: { type: "string", description: "Comment text." },
      },
      required: ["cardId", "text"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_search_cards",
    description: "Search cards accessible to the user (returns cards only).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query string." },
        boardId: { type: "string", description: "Optional board id to scope search." },
        limit: { type: "number", description: "Max cards to return (default 50, max 1000 depending on Trello)." },
        includeClosed: { type: "boolean", description: "Whether to include closed cards (default false)." },
        raw: { type: "boolean", description: "If true, return raw /search response instead of cards array." },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_update_card",
    description: "Update card fields (name/desc/due/members/labels/closed).",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        name: { type: "string", description: "Card title." },
        desc: { type: "string", description: "Card description." },
        due: { type: "string", description: "Due date ISO string (e.g. 2026-04-20T12:00:00Z) or null/empty to clear." },
        idMembers: { type: "array", items: { type: "string" }, description: "Member ids to set (replaces members)." },
        idLabels: { type: "array", items: { type: "string" }, description: "Label ids to set (replaces labels)." },
        closed: { type: "boolean", description: "Archive/unarchive card." },
      },
      required: ["cardId"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_create_board",
    description: "Create a Trello board.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Board name." },
        defaultLists: { type: "boolean", description: "Whether to create default lists." },
        desc: { type: "string", description: "Board description." },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_list_labels",
    description: "List labels in a board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "string", description: "Trello board id (optional if TRELLO_DEFAULT_BOARD_ID is set)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "trello_create_label",
    description: "Create a label in a board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "string", description: "Trello board id (optional if TRELLO_DEFAULT_BOARD_ID is set)." },
        name: { type: "string", description: "Label name." },
        color: { type: "string", description: "Label color (e.g. green, yellow, orange, red, purple, blue, sky, lime, pink, black)." },
      },
      required: ["color"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_add_label_to_card",
    description: "Add a label to a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        labelId: { type: "string", description: "Trello label id." },
      },
      required: ["cardId", "labelId"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_remove_label_from_card",
    description: "Remove a label from a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        labelId: { type: "string", description: "Trello label id." },
      },
      required: ["cardId", "labelId"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_list_board_members",
    description: "List members of a board.",
    inputSchema: {
      type: "object",
      properties: {
        boardId: { type: "string", description: "Trello board id (optional if TRELLO_DEFAULT_BOARD_ID is set)." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "trello_set_card_members",
    description: "Replace card members with the provided member ids.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        idMembers: { type: "array", items: { type: "string" }, description: "Member ids to set (replaces members)." },
      },
      required: ["cardId", "idMembers"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_add_card_members",
    description: "Add members to a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        idMembers: { type: "array", items: { type: "string" }, description: "Member ids to add." },
      },
      required: ["cardId", "idMembers"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_remove_card_members",
    description: "Remove members from a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        idMembers: { type: "array", items: { type: "string" }, description: "Member ids to remove." },
      },
      required: ["cardId", "idMembers"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_add_attachment",
    description: "Add an attachment (URL) to a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        url: { type: "string", description: "Public URL to attach." },
        name: { type: "string", description: "Optional attachment name." },
      },
      required: ["cardId", "url"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_create_checklist",
    description: "Create a checklist on a card.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        name: { type: "string", description: "Checklist name." },
      },
      required: ["cardId", "name"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_add_checklist_item",
    description: "Add an item to a checklist.",
    inputSchema: {
      type: "object",
      properties: {
        checklistId: { type: "string", description: "Checklist id." },
        name: { type: "string", description: "Item name." },
        checked: { type: "boolean", description: "Whether the item starts checked." },
      },
      required: ["checklistId", "name"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_set_checklist_item_state",
    description: "Mark a checklist item complete/incomplete.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Card id (required by Trello endpoint)." },
        checkItemId: { type: "string", description: "Check item id." },
        state: { type: "string", description: "complete or incomplete." },
      },
      required: ["cardId", "checkItemId", "state"],
      additionalProperties: false,
    },
  },
  {
    name: "trello_move_card_advanced",
    description: "Move a card across lists/boards and/or change its position.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: { type: "string", description: "Trello card id." },
        listId: { type: "string", description: "Destination list id." },
        boardId: { type: "string", description: "Destination board id." },
        pos: { type: "string", description: "Position: top, bottom, or a positive number string." },
      },
      required: ["cardId"],
      additionalProperties: false,
    },
  },
];

