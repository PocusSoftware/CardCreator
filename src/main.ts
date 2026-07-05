import { mount } from "svelte";
import App from "./app.svelte";

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "/app.css";
document.head.appendChild(link);

const target = document.getElementById("app");
if (!target) throw new Error("#app not found");

mount(App, { target });
