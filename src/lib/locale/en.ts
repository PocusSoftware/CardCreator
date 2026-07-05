export const englishLocale = {
  "panel": {
    "card_editor": {
      "parent_deferral_cards": "Deferral cards",
      "layers_heading": "Layers",
      "properties_heading": "Properties",
      "select_element_hint": "Select an element on the card or in the layers list to edit it.",
      "custom_placeholders_footer": "Custom placeholders are configured on the",
      "custom_placeholders_footer_link": "Deferral Cards",
      "custom_placeholders_footer_suffix": "settings tab.",
      "coord_x": "X",
      "coord_y": "Y",
      "width": "Width",
      "height": "Height",
      "custom_text_placeholder": "Write anything — plain text or HTML. Use {requestId}, {customMessage}, or your placeholders.",
      "image_upload_failed": "Image upload failed",
      "image_preview_alt": "Uploaded image preview",
      "no_image_yet": "No image yet. SVG up to %{svgKb} KB; PNG/GIF up to %{pngKb} KB each (GIF animates).",
      "upload_image": "Upload image",
      "logo_drag_hint": "Drag to reposition. Toggle visibility with the layer list or the global watermark switch.",
      "discard_scenario_title": "Discard unsaved changes?",
      "discard_scenario_message": "has unsaved edits. Discard them and continue?",
      "discard_action": "Discard",
      "leave_unsaved_title": "Leave without saving?",
      "leave_unsaved_message": "Unsaved changes on:",
      "leave_unsaved_suffix": "Leave anyway? Only saved cards are kept on the server.",
      "leave_action": "Leave",
      "restore_default_title": "Restore default card?",
      "restore_default_message": "Replace this scenario with the built-in default layout and content. Your current edits are not saved until you click Save.",
      "restore_action": "Restore",
      "cannot_restore_title": "Cannot restore",
      "cannot_restore_msg": "Addon scenarios use the addon default template — re-save from the addon manifest.",
      "default_restored_title": "Default layout restored",
      "default_restored_msg": "Save to persist.",
      "save_failed_select_scenario": "Select a scenario first.",
      "saving_scenario": "Saving %{label}…",
      "save_failed_no_response": "No response from server (timeout or connection lost).",
      "save_failed_rejected": "Server rejected the changes.",
      "scenario_saved_title": "%{label} saved",
      "scenario_saved_msg": "This card is saved on the server.",
      "cards_exported_msg": "All scenarios",
      "import_failed": "Import failed",
      "addon_cards_skipped_title": "Some addon cards skipped",
      "imported_title": "Imported",
      "imported_scenarios_msg": "%{count} scenario(s)",
      "invalid_json": "Invalid JSON",
      "toolbar": {
        "scenario_placeholder": "Scenario…",
        "group_core": "Core",
        "group_addons": "Addons",
        "size_custom": "Custom",
        "card_width_aria": "Card width",
        "card_height_aria": "Card height",
        "add": "Add",
        "watermark_logo": "Watermark logo",
        "snap_to_grid": "Snap to grid",
        "show_grid": "Show grid",
        "file": "File",
        "export_all": "Export all (JSON)",
        "export_all_lua": "Export all (Lua)",
        "export_scenario": "Export scenario (JSON)",
        "export_scenario_lua": "Export scenario (Lua)",
        "restore_default": "Restore default",
        "import": "Import",
        "save_card": "Save card",
        "saved": "Saved",
        "back": "Back"
      },
      "layers": {
        "empty": "No elements yet.",
        "show_element": "Show element",
        "hide_element": "Hide element"
      },
      "canvas": {
        "editor_title": "Card Editor",
        "preview_title": "Preview",
        "size_line": "%{width}×%{height}px",
        "snap_free": "free placement",
        "snap_grid": "snap %{grid}px",
        "grid_visible": "grid %{grid}px",
        "max_size": "max %{maxW}×%{maxH}",
        "blank_hint": "Select a scenario to load its default layout"
      },
      "card": {
        "drag_aria": "%{type}, drag to move",
        "watermark_aria": "Watermark logo",
        "default_heading": "Access Denied",
        "ban_id_label": "Ban ID:",
        "ban_reason_label": "Reason:",
        "ban_expires_label": "Expires:",
        "tier_label": "Tier:",
        "button_url_invalid": "Set a valid https:// URL"
      },
      "button_editor": {
        "label": "Button label",
        "label_placeholder": "Join Discord",
        "url": "Link URL",
        "url_placeholder": "https://discord.gg/your-server or {discordInvite}",
        "background": "Background",
        "text_color": "Text",
        "hint": "Opens in the player's browser when they click during connection. Use http/https only; placeholders like {discordInvite} work."
      },
      "placeholders_editor": {
        "builtin_title": "Built-in tokens",
        "addon_title": "Addon tokens (dynamic)",
        "addon_desc": "Resolved at connect time by the owning addon. Use in any block as",
        "custom_title": "Custom placeholders",
        "add": "Add",
        "empty": "Define extra static tokens and use {key} in any block.",
        "key_aria": "Placeholder key",
        "key_placeholder": "key",
        "label_aria": "Placeholder label",
        "label_placeholder": "Label",
        "value_aria": "Placeholder value",
        "value_placeholder": "Value at connect",
        "remove_aria": "Remove placeholder",
        "default_custom_label": "Custom"
      },
      "visual_editor": {
        "layout_title": "Card layout",
        "add_block": "Add block",
        "switch_on": "On",
        "switch_off": "Off",
        "remove_block": "Remove",
        "custom_text_placeholder": "Write anything…",
        "title_placeholder": "Card title"
      },
      "size_presets": {
        "wide": "Wide (640×220)",
        "compact": "Compact (400×160)",
        "tall": "Tall (520×320)"
      },
      "blocks": {
        "heading": {
          "label": "Title",
          "description": "Card heading (defaults to scenario title)",
          "default_content": ""
        },
        "text": {
          "label": "Text line",
          "description": "Single line (use one per sentence or field)",
          "default_content": "Your message here"
        },
        "paragraph": {
          "label": "Paragraph",
          "description": "Rich text with tokens",
          "default_content": "Please join {guildName} and request to be whitelisted."
        },
        "rejection_message": {
          "label": "Rejection message",
          "description": "Shows the rejection message (the {customMessage} token)",
          "default_content": "{customMessage}"
        },
        "custom_text": {
          "label": "Custom text",
          "description": "Freeform text — write anything; supports placeholders and basic HTML",
          "default_content": ""
        },
        "request_id": {
          "label": "Request ID",
          "description": "Shows the player request ID when available",
          "default_content": ""
        },
        "ban_id": {
          "label": "Ban ID",
          "description": "Shows the active ban action ID",
          "default_content": ""
        },
        "ban_reason": {
          "label": "Ban reason",
          "description": "Shows the ban reason ({banReason}) when the player is banned",
          "default_content": ""
        },
        "ban_expires": {
          "label": "Ban expiry",
          "description": "Shows time until ban expires ({banExpires}); hidden for permanent bans",
          "default_content": ""
        },
        "tier_name": {
          "label": "Tier name",
          "description": "Shows whitelist tier when available",
          "default_content": ""
        },
        "spacer": {
          "label": "Spacer",
          "description": "Vertical gap",
          "default_content": ""
        },
        "divider": {
          "label": "Divider",
          "description": "Horizontal rule",
          "default_content": ""
        },
        "logo": {
          "label": "Watermark logo",
          "description": "Watermark logo (respects global logo toggle)",
          "default_content": ""
        },
        "custom_image": {
          "label": "Custom image",
          "description": "Upload SVG, PNG, or GIF — shown on the deferral card",
          "default_content": ""
        },
        "button": {
          "label": "Button (link)",
          "description": "Clickable link styled as a button — opens in the player's browser (http/https only)",
          "default_content": ""
        }
      },
      "scenarios": {
        "ban_temporary": {
          "label": "Ban — temporary",
          "description": "Shown when the player has an active timed ban."
        },
        "ban_permanent": {
          "label": "Ban — permanent",
          "description": "Shown when the player has a permanent ban."
        },
        "whitelist_pending": {
          "label": "Whitelist — pending approval",
          "description": "Manual review: player is not on the list; includes request ID when enabled."
        },
        "whitelist_schedule_closed": {
          "label": "Whitelist — applications closed",
          "description": "Join attempted outside configured application windows."
        },
        "whitelist_admin_denied": {
          "label": "Whitelist — admin-only denied",
          "description": "Maintenance mode: player is not a panel administrator."
        },
        "whitelist_admin_insufficient_ids": {
          "label": "Whitelist — admin-only missing IDs",
          "description": "Maintenance mode: missing license or Discord identifier."
        },
        "whitelist_discord_member_denied": {
          "label": "Whitelist — not in Discord",
          "description": "Discord member workflow: user is not in the guild."
        },
        "whitelist_discord_member_insufficient_ids": {
          "label": "Whitelist — Discord member missing ID",
          "description": "Discord member workflow: no discord: identifier."
        },
        "whitelist_discord_roles_not_member": {
          "label": "Whitelist — roles: not in guild",
          "description": "Discord roles workflow: user is not in the guild."
        },
        "whitelist_discord_roles_no_roles": {
          "label": "Whitelist — roles: missing role",
          "description": "Discord roles workflow: member lacks a required role."
        },
        "whitelist_discord_roles_insufficient_ids": {
          "label": "Whitelist — roles: missing ID",
          "description": "Discord roles workflow: no discord: identifier."
        },
        "whitelist_insufficient_license": {
          "label": "Whitelist — missing license",
          "description": "Manual review: no license identifier on connect."
        },
        "whitelist_error": {
          "label": "Whitelist — validation error",
          "description": "Discord or internal validation failed while checking whitelist."
        },
        "connection_queue": {
          "label": "Connection queue",
          "description": "Placeholder for server queue / deferral messaging (hook up from your queue resource)."
        },
        "access_denied": {
          "label": "Access denied (generic)",
          "description": "Fallback card when no specific scenario is matched."
        }
      }
    },
    "common": {
      "cancel": "Cancel",
      "save": "Save",
      "close": "Close",
      "enabled": "Enabled",
      "disabled": "Disabled",
      "select_placeholder": "Select...",
      "none": "none",
      "now": "now",
      "skipped": "skipped",
      "start": "Start",
      "stop": "Stop",
      "restart": "Restart",
      "edit": "Edit",
      "schedule": "Schedule",
      "send": "Send",
      "required": "Required",
      "loading": "Loading...",
      "loading_ellipsis": "loading...",
      "saving": "Saving...",
      "view": "View",
      "remove": "Remove",
      "optional": "optional",
      "yes": "Yes",
      "no": "No",
      "hour": "Hour",
      "minute": "Minute",
      "select_hour": "Select hour",
      "select_minute": "Select minute",
      "add_time": "Add Time",
      "never": "Never"
    },
    "routes": {
      "card_editor": "Card Editor",
      "deferral_editor": "Deferral Card Editor"
    },
    "toasts": {
      "save_failed": "Save failed",
      "import_failed": "Import failed",
      "card_exported": "Card exported",
      "discard_unsaved_title": "Discard unsaved changes?"
    }
  }
} as const;
