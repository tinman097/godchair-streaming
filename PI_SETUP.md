# GodChair — Running on a Raspberry Pi 4

This guide walks you through deploying GodChair on a Raspberry Pi 4 so anyone on your home network can access it.

## What You Need

- A Raspberry Pi 4 (2GB RAM minimum, 4GB+ recommended)
- A microSD card with Raspberry Pi OS (or any Debian-based Linux)
- Your Pi connected to your home network (WiFi or Ethernet)
- The GodChair project files on the Pi

---

## Step 1 — Get the Project on Your Pi

Option A — Copy from your computer:
```bash
# From your computer, copy the project folder to the Pi
scp -r ./godchair pi@<pi-ip-address>:~/godchair
```

Option B — Clone from a Git repository:
```bash
# On the Pi
git clone <your-repo-url> ~/godchair
cd ~/godchair
```

---

## Step 2 — Install Node.js (if not already installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify:
```bash
node -v   # Should show v20.x
npm -v
```

---

## Step 3 — Install Dependencies & Build

```bash
cd ~/godchair
npm ci --omit=dev
npm run build
```

This creates a `dist/` folder with the optimized production files.

---

## Step 4 — Run It

### Quick Test

```bash
node server.mjs
```

You should see:
```
GodChair running on port 3000
Local:  http://localhost:3000
Network: http://<pi-ip>:3000
```

Open a browser on any device on your network and go to `http://<pi-ip-address>:3000`.

### Run It Permanently (Starts on Boot)

Use the included deployment script:
```bash
chmod +x deploy/pi-deploy.sh
./deploy/pi-deploy.sh
```

This installs GodChair as a system service that:
- Starts automatically when the Pi boots
- Restarts automatically if it crashes
- Runs in the background (no terminal needed)

---

## Step 5 — Management Commands

Once the service is installed:

| Action | Command |
|--------|---------|
| Check status | `sudo systemctl status godchair` |
| Stop | `sudo systemctl stop godchair` |
| Start | `sudo systemctl start godchair` |
| Restart | `sudo systemctl restart godchair` |
| View live logs | `sudo journalctl -u godchair -f` |
| View last 100 lines | `sudo journalctl -u godchair -n 100` |

---

## Step 6 — Find Your Pi's IP Address

```bash
hostname -I
```

The first number is your Pi's IP (e.g., `192.168.1.50`). Use that to access GodChair from any phone, tablet, or computer on your network.

---

## Optional — Make It Accessible Outside Your Home

By default, GodChair is only reachable on your local network. To access it from anywhere:

### Option A — Port Forwarding (advanced)
1. Log into your router's admin panel
2. Forward port 3000 to your Pi's IP address
3. Access via your home's public IP: `http://<your-public-ip>:3000`

**Warning:** Only do this if you understand the security implications. Your Pi will be exposed to the internet.

### Option B — Use a Tunnel (recommended)
Use a free tunnel service like Cloudflare Tunnel or Tailscale for secure remote access without opening router ports.

---

## Performance Tips for Pi 4

- Use a Pi 4 with at least 2GB RAM (4GB is ideal)
- Boot from a USB SSD instead of microSD for better performance
- Close unused background services on the Pi
- The built-in 6-hour API cache means the Pi rarely makes external requests after the first load
- The production build is only ~200KB gzipped, so it loads fast even on Pi hardware

---

## Troubleshooting

**Port 3000 already in use?**
Change the port: `PORT=8080 node server.mjs`

**Can't access from another device?**
- Make sure both devices are on the same network
- Check the Pi's firewall: `sudo ufw status` (if enabled, allow port 3000: `sudo ufw allow 3000`)

**Build fails?**
Make sure you have enough disk space: `df -h`. The build needs about 200MB free.

**Service won't start?**
Check the logs: `sudo journalctl -u godchair -n 50`
Make sure the paths in `deploy/godchair.service` match your setup (default: `/home/pi/godchair`).
