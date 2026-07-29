// A staged boot sequence: firmware menu first, then a compact Linux-like log.
import { h } from '../lib/dom.js';
import { BOOT_MS, GRUB_SELECT_MS, GRUB_WAIT_MS } from '../lib/constants.js';

const BOOT_MESSAGES = [
  '[    0.000000] WebOS kernel 6.8.0-webos booting',
  '[    0.184216] ACPI: PM: Preparing to enter system sleep state',
  '[    0.463821] usb 1-1: new high-speed USB device detected',
  '[    0.817404] systemd[1]: Mounted /sysroot.',
  '[    1.204118] systemd[1]: Started Network Manager.',
  '[    1.687641] webos-session: Loading desktop compositor...',
  '[    2.106920] webos-session: Starting graphical target.'
];

function BootMenu({ selected, secondsLeft }) {
  return h('section', { className: 'boot-menu', 'aria-label': 'Boot menu' },
    h('div', { className: 'boot-menu__brand' }, 'GNU GRUB  version 2.12'),
    h('div', { className: 'boot-menu__list' },
      h('div', { className: `boot-menu__choice ${selected ? 'boot-menu__choice--active' : ''}` }, 'WebOs GNU/Linux'),
      h('div', { className: 'boot-menu__choice' }, 'WebOS GNU/Linux (recovery mode)'),
      h('div', { className: 'boot-menu__choice' }, 'Memory test (memtest86+)')
    ),
    h('p', { className: 'boot-menu__hint' }, 'Use the arrow keys to select an entry. Press Enter to boot.'),
    h('div', { className: 'boot-menu__timer' }, selected ? 'Selected: WebOs GNU/Linux' : `Automatic boot in ${secondsLeft}s…`)
  );
}

function LinuxBoot({ progress }) {
  const visibleCount = Math.max(1, Math.min(BOOT_MESSAGES.length, Math.ceil(progress / 100 * BOOT_MESSAGES.length)));
  const messages = BOOT_MESSAGES.slice(0, visibleCount);
  const status = progress < 62 ? 'Starting system services' : progress < 92 ? 'Launching WebOS session' : 'Graphical target reached';
  return h('section', { className: 'linux-boot', 'aria-label': 'Linux startup log' },
    h('div', { className: 'linux-boot__head' },
      h('span', { className: 'linux-boot__mark' }, 'webos'),
      h('span', null, 'GNU/Linux 6.8.0-webos x86_64')
    ),
    h('div', { className: 'linux-boot__log', 'aria-live': 'polite' },
      ...messages.map((message, index) => h('p', { className: 'linux-boot__line', key: message, style: { '--line-delay': `${index * 55}ms` } }, message)),
      h('p', { className: 'linux-boot__cursor', 'aria-hidden': 'true' }, '_')
    ),
    h('div', { className: 'linux-boot__footer' },
      h('span', null, status),
      h('span', null, `${Math.round(progress)}%`)
    ),
    h('div', { className: 'linux-boot__track', role: 'progressbar', 'aria-label': 'WebOS startup progress', 'aria-valuenow': progress, 'aria-valuemin': 0, 'aria-valuemax': 100 },
      h('div', { className: 'linux-boot__fill', style: { width: `${progress}%` } })
    )
  );
}

export function BootScreen({ progress }) {
  const selectAt = GRUB_WAIT_MS / BOOT_MS * 100;
  const bootAt = (GRUB_WAIT_MS + GRUB_SELECT_MS) / BOOT_MS * 100;
  const showMenu = progress < bootAt;
  const selected = progress >= selectAt;
  const secondsLeft = Math.max(0, Math.ceil((selectAt - progress) / 100 * BOOT_MS / 1000));
  const linuxProgress = Math.min(100, Math.max(0, (progress - bootAt) / (100 - bootAt) * 100));
  return h('div', { className: `boot-screen ${showMenu ? 'boot-screen--menu' : 'boot-screen--linux'}` },
    h('div', { className: 'boot-screen__grain', 'aria-hidden': 'true' }),
    h('div', { className: 'boot-screen__content' }, showMenu ? h(BootMenu, { selected, secondsLeft }) : h(LinuxBoot, { progress: linuxProgress }))
  );
}
