/**
 * Todo:
 * css parts
 *
 * DOCS:
 * generic-tab should have a label attribute
 *
 * Tabs should be buttons
 * Tabs should have slot tab
 *
 * Panels should have slot panel
 */

import { KEYCODES } from '../utils/keycodes.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    div[role="tablist"] {
      display: flex;
    }
  </style>

  <div part="tablist" role="tablist">
    <slot name="tab"></slot>
  </div>

  <div part="panel">
    <slot name="panel"></slot>
  </div>
`;

export class GenericTabs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    if (this.hasAttribute('active-item')) {
      this.__index = Number(this.getAttribute('active-item'));
    } else {
      this.__index = 0;
    }

    this.__tablist = this.shadowRoot.querySelector('div[role="tablist"]');
    this.__tablist.addEventListener('keydown', this.__onKeyDown.bind(this));

    this.__tablist.setAttribute('aria-label', this.getAttribute('label') || 'tablist');
    this.__tablist.addEventListener('click', this.__onTabClicked.bind(this));

    this.setAttribute('active-item', this.__index);
  }

  static get observedAttributes() {
    return ['active-item'];
  }

  // eslint-disable-next-line
  attributeChangedCallback(name, newVal, oldVal) {
    if (name === 'active-item') {
      if (newVal !== oldVal) {
        this.__index = Number(this.getAttribute('active-item'));
        this.__updateActive();
      }
    }
  }

  get activeItem() {
    return this.__index;
  }

  set activeItem(val) {
    this.__index = val;
    this.setAttribute('active-item', this.__index);
  }

  __onKeyDown(event) {
    const tabs = this.__getTabs();

    switch (event.keyCode) {
      case KEYCODES.LEFT:
        if (this.__index === 0) {
          this.__index = tabs.length - 1;
        } else {
          this.__index--; // eslint-disable-line
        }
        event.preventDefault();
        break;

      case KEYCODES.RIGHT:
        if (this.__index === tabs.length - 1) {
          this.__index = 0;
        } else {
          this.__index++; // eslint-disable-line
        }
        event.preventDefault();
        break;

      case KEYCODES.HOME:
        this.__index = 0;
        break;

      case KEYCODES.END:
        this.__index = tabs.length - 1;
        break;
      default:
        return;
    }
    this.setAttribute('active-item', this.__index);
    this.__focus();
  }

  __updateActive() {
    const tabs = this.__getTabs();
    const panels = this.__getPanels();

    if (!tabs || !panels) return;
    tabs.forEach((_, i) => {
      if (i === this.__index) {
        this.setAttribute('active-item', this.__index);
        tabs[i].setAttribute('active', '');
        tabs[i].setAttribute('aria-selected', 'true');
        tabs[i].removeAttribute('tabindex');
        panels[i].removeAttribute('hidden');
        this.value = tabs[i].textContent.trim();
      } else {
        tabs[i].removeAttribute('active');
        tabs[i].setAttribute('aria-selected', 'false');
        tabs[i].setAttribute('tabindex', '-1');
        panels[i].setAttribute('hidden', '');
      }

      tabs[i].setAttribute('role', 'tab');
      panels[i].setAttribute('role', 'tabpanel');

      tabs[i].id = `generic-tab-${i}`;
      tabs[i].setAttribute('aria-controls', `generic-tab-${i}`);
      panels[i].setAttribute('aria-labelledby', `generic-tab-${i}`);
    });

    const { __index } = this;
    this.dispatchEvent(
      new CustomEvent('active-changed', {
        detail: __index,
      }),
    );
  }

  __onTabClicked(e) {
    if (e.target.getAttribute('role') !== 'tab') return;
    this.__index = this.__getTabs().indexOf(e.target);
    this.setAttribute('active-item', this.__index);
    this.__focus();
  }

  __focus() {
    const tabs = this.__getTabs();
    tabs[this.__index].focus();
  }

  __getTabs() {
    return [...this.querySelectorAll('[slot="tab"]')];
  }

  __getPanels() {
    return [...this.querySelectorAll('[slot="panel"]')];
  }

  setActive(index) {
    this.__index = index;
    this.setAttribute('active-item', this.__index);
  }
}
