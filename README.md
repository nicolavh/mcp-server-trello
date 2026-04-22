# MCP Trello (Cursor)

Servidor **MCP** para Trello basado en el **API REST oficial** (`https://api.trello.com/1`), pensado para conectarse desde **Cursor** vía **stdio**.

## Qué incluye

- **Listado** de boards, lists y cards.
- **Lectura** de una card (incluye últimos comentarios).
- **Creación** de cards, **mover** cards entre listas, y **comentar**.
- **Búsqueda** de cards (opcionalmente acotada a un board).
- Soporte de **defaults** por entorno para no tener que pasar `boardId`/`listId` todo el tiempo.

## Requisitos

- **Node.js 18+** (recomendado **20+**).
- **Trello API Key** y **Token**.

## Obtener credenciales de Trello

- **API Key**: desde “Developer API Keys” en Trello.
- **Token**: se genera asociado a esa key.

## Configuración en Cursor (MCP)

### Instalación simple con npx (desde GitHub público) — recomendado

Puedes lanzarlo con `npx` directamente desde GitHub

Config de Cursor (copy/paste):

```json
{
  "mcpServers": {
    "trello": {
      "command": "bash",
      "args": ["-lc", "exec npx -y github:nicolavh/mcp_server-trello"],
      "env": {
        "TRELLO_KEY": "YOUR_KEY",
        "TRELLO_TOKEN": "YOUR_TOKEN",
        "TRELLO_DEFAULT_BOARD_ID": "",
        "TRELLO_DEFAULT_LIST_ID": ""
      }
    }
  }
}
```

Notas:

- Si tu default branch no es `main`, puedes fijar un ref: `github:nicolavh/mcp_server-trello#branch_o_tag`.
- `-y` evita prompts interactivos.s

## sVariables de entorno

Obligatorias:

- `**TRELLO_KEY**`: Trello API key.
- `**TRELLO_TOKEN**`: Trello API token.

Opcionales:

- `**TRELLO_DEFAULT_BOARD_ID**`: si lo defines, `trello_list_lists` puede omitirse `boardId`.
- `**TRELLO_DEFAULT_LIST_ID**`: si lo defines, `trello_list_cards` y `trello_create_card` pueden omitir `listId`.
- `**MCP_TRELLO_ENTRY**`: path absoluto al entry (normalmente `.../dist/index.js`). Útil si configuras Cursor con la Opción A, o si quieres sobreescribir el default del launcher en la Opción B.

## Tools disponibles

### `trello_list_boards`

Lista boards accesibles por el usuario autenticado.

### `trello_list_lists`

Entrada:

- `boardId?`: opcional si `TRELLO_DEFAULT_BOARD_ID` está seteado.

### `trello_list_cards`

Entrada:

- `listId?`: opcional si `TRELLO_DEFAULT_LIST_ID` está seteado.

### `trello_get_card`

Entrada:

- `cardId` (requerido)

Incluye metadata de la card y los últimos comentarios (limitado a 20 acciones `commentCard`).

### `trello_create_card`

Entrada:

- `name` (requerido)
- `listId?` (opcional si `TRELLO_DEFAULT_LIST_ID` está seteado)
- `desc?` (markdown soportado por Trello)
- `due?` (string ISO, por ejemplo `2026-04-20T12:00:00Z`)
- `idMembers?` (array de ids de miembro)

### `trello_move_card`

Entrada:

- `cardId` (requerido)
- `listId` (requerido; lista destino)

### `trello_add_comment`

Entrada:

- `cardId` (requerido)
- `text` (requerido)

### `trello_search_cards`

Entrada:

- `query` (requerido)
- `boardId?` (opcional; acota el search)
- `limit?` (opcional; default 50)
- `includeClosed?` (opcional; default false)
- `raw?` (opcional; si `true` devuelve el raw de `/search`)

Por defecto devuelve **solo el array de cards**. Con `raw: true`, devuelve el objeto completo de `/search`.

### `trello_update_card`

Actualiza campos de una card.

Entrada:

- `cardId` (requerido)
- `name?`, `desc?`, `due?`, `idMembers?`, `idLabels?`, `closed?`

### `trello_create_board`

Entrada:

- `name` (requerido)
- `defaultLists?`, `desc?`

### `trello_list_labels`

Entrada:

- `boardId?` (opcional si `TRELLO_DEFAULT_BOARD_ID`)

### `trello_create_label`

Entrada:

- `color` (requerido)
- `boardId?` (opcional si `TRELLO_DEFAULT_BOARD_ID`)
- `name?`

### `trello_add_label_to_card` / `trello_remove_label_from_card`

Entrada:

- `cardId` (requerido)
- `labelId` (requerido)

### `trello_list_board_members`

Entrada:

- `boardId?` (opcional si `TRELLO_DEFAULT_BOARD_ID`)

### `trello_set_card_members` / `trello_add_card_members` / `trello_remove_card_members`

Entrada:

- `cardId` (requerido)
- `idMembers` (requerido; array)

### `trello_add_attachment`

Entrada:

- `cardId` (requerido)
- `url` (requerido)
- `name?`

### `trello_create_checklist`

Entrada:

- `cardId` (requerido)
- `name` (requerido)

### `trello_add_checklist_item`

Entrada:

- `checklistId` (requerido)
- `name` (requerido)
- `checked?`

### `trello_set_checklist_item_state`

Entrada:

- `cardId` (requerido)
- `checkItemId` (requerido)
- `state` (requerido; `complete` o `incomplete`)

### `trello_move_card_advanced`

Entrada:

- `cardId` (requerido)
- `listId?`, `boardId?`, `pos?` (proveer al menos uno)
