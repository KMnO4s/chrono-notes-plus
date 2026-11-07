# Architecture
- Keep interface translations in a shared language context and dictionary; persist the selected language in the existing Standard Notes settings so all views use the same note-level preference.- UI color tokens resolve to Standard Notes --sn-stylekit-* variables first (via --app-* in index.css), falling back to app HSL tokens; why: the editor must stay readable in any SN theme.
