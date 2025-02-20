class SpeedTest {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.testDuration = {
            download: 10000, // 10 seconds
            upload: 10000    // 10 seconds
        };
        this.maxSpeed = 100;
        this.resizeSpeedometer();
        this.drawSpeedometer(0);

        // Add resize listener
        window.addEventListener('resize', () => {
            this.resizeSpeedometer();
            this.drawSpeedometer(parseFloat(this.speedDisplay.textContent) || 0);
        });
    }

    initializeElements() {
        this.startButton = document.getElementById('startTest');
        this.speedDisplay = document.getElementById('speed');
        this.downloadSpeedDisplay = document.getElementById('downloadSpeed');
        this.uploadSpeedDisplay = document.getElementById('uploadSpeed');
        this.pingDisplay = document.getElementById('ping');
        this.canvas = document.getElementById('speedometer');
        this.ctx = this.canvas.getContext('2d');
        this.progressBar = document.getElementById('progressBar');
        this.testPhase = document.getElementById('testPhase');
        // Removed timer element
    }

    resizeSpeedometer() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, 500); // Set maximum size to 500px
        this.canvas.width = size;
        this.canvas.height = size; // Make it perfectly square
    }

    drawSpeedometer(speed) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.4; // Adjust radius for perfect circle

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background circle
        this.drawCircularBackground(ctx, centerX, centerY, radius);

        // Draw speed arc
        const percentage = Math.min(speed / this.maxSpeed, 1);
        this.drawSpeedArc(ctx, centerX, centerY, radius, percentage);

        // Draw numbers and ticks
        this.drawNumbersAndTicks(ctx, centerX, centerY, radius);

        // Draw needle
        this.drawNeedle(ctx, centerX, centerY, radius, percentage);

        // Draw digital display
        this.drawDigitalDisplay(ctx, centerX, centerY, speed, radius);
    }

    drawCircularBackground(ctx, centerX, centerY, radius) {
        // Draw outer circle with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.95, centerX, centerY, radius * 1.05);
        gradient.addColorStop(0, '#f0f0f0');
        gradient.addColorStop(1, '#e0e0e0');

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.lineWidth = radius * 0.1;
        ctx.strokeStyle = gradient;
        ctx.stroke();
    }

    drawSpeedArc(ctx, centerX, centerY, radius, percentage) {
        const startAngle = Math.PI * 0.75; // Start at -135 degrees
        const endAngle = startAngle + (Math.PI * 1.5 * percentage); // Sweep 270 degrees

        const gradient = ctx.createLinearGradient(
            centerX - radius, centerY - radius,
            centerX + radius, centerY + radius
        );
        gradient.addColorStop(0, this.getSpeedColor(percentage));
        gradient.addColorStop(1, this.getSpeedColorEnd(percentage));

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineWidth = radius * 0.1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = gradient;
        ctx.stroke();
    }

    drawNumbersAndTicks(ctx, centerX, centerY, radius) {
        const totalTicks = 100;
        const majorTicksEvery = 10;
        const startAngle = Math.PI * 0.75;
        const endAngle = Math.PI * 2.25;
        const angleStep = (endAngle - startAngle) / totalTicks;

        ctx.font = `bold ${radius * 0.15}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= totalTicks; i++) {
            const angle = startAngle + (i * angleStep);
            const isMajorTick = i % majorTicksEvery === 0;
            
            // Draw tick
            const tickStart = radius * (isMajorTick ? 0.8 : 0.85);
            const tickEnd = radius * 0.95;
            const tickX1 = centerX + Math.cos(angle) * tickStart;
            const tickY1 = centerY + Math.sin(angle) * tickStart;
            const tickX2 = centerX + Math.cos(angle) * tickEnd;
            const tickY2 = centerY + Math.sin(angle) * tickEnd;

            ctx.beginPath();
            ctx.moveTo(tickX1, tickY1);
            ctx.lineTo(tickX2, tickY2);
            ctx.lineWidth = radius * (isMajorTick ? 0.02 : 0.01);
            ctx.strokeStyle = isMajorTick ? '#333' : '#666';
            ctx.stroke();

            // Draw numbers for major ticks
            if (isMajorTick) {
                const number = i / majorTicksEvery * 10;
                const textRadius = radius * 0.7;
                const textX = centerX + Math.cos(angle) * textRadius;
                const textY = centerY + Math.sin(angle) * textRadius;
                
                ctx.fillStyle = '#333';
                ctx.fillText(number.toString(), textX, textY);
            }
        }
    }

    drawNeedle(ctx, centerX, centerY, radius, percentage) {
        const angle = Math.PI * 0.75 + (Math.PI * 1.5 * percentage);
        
        // Draw needle shadow
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw needle
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * radius * 0.8,
            centerY + Math.sin(angle) * radius * 0.8
        );
        ctx.strokeStyle = '#e53935';
        ctx.lineWidth = radius * 0.03;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Reset shadow
        ctx.shadowColor = 'transparent';

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = '#e53935';
        ctx.fill();
        ctx.strokeStyle = '#b71c1c';
        ctx.lineWidth = radius * 0.02;
        ctx.stroke();
    }

    drawDigitalDisplay(ctx, centerX, centerY, speed, radius) {
        // Draw speed value
        ctx.font = `bold ${radius * 0.3}px Arial`;
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(speed.toFixed(1), centerX, centerY + radius * 0.4);

        // Draw Mbps label
        ctx.font = `${radius * 0.15}px Arial`;
        ctx.fillText('Mbps', centerX, centerY + radius * 0.6);
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.startTest());
    }

    async startTest() {
        try {
            this.startButton.disabled = true;
            this.resetDisplays();
            
            this.testPhase.textContent = "Testing Ping...";
            await this.measurePing();
            
            this.testPhase.textContent = "Measuring Download Speed...";
            await this.measureDownloadSpeed();
            
            this.testPhase.textContent = "Measuring Upload Speed...";
            await this.measureUploadSpeed();

            this.testPhase.textContent = "Test Completed";
            this.progressBar.style.width = '100%';
        } catch (error) {
            console.error('Test failed:', error);
            this.testPhase.textContent = "Test Failed - Please try again";
        } finally {
            this.startButton.disabled = false;
            this.startButton.textContent = 'Start New Test';
        }
    }

    resetDisplays() {
        this.speedDisplay.textContent = '0.0';
        this.downloadSpeedDisplay.textContent = '0.00 Mbps';
        this.uploadSpeedDisplay.textContent = '0.00 Mbps';
        this.pingDisplay.textContent = '0 ms';
        this.progressBar.style.width = '0%';
        this.startButton.textContent = 'Testing...';
        this.drawSpeedometer(0);
    }

    async measurePing() {
        try {
            const start = performance.now();
            await fetch('https://www.google.com', { 
                mode: 'no-cors', 
                cache: 'no-store' 
            });
            const ping = Math.round(performance.now() - start);
            this.pingDisplay.textContent = `${ping} ms`;
            this.progressBar.style.width = '25%';
        } catch (error) {
            console.error('Ping test failed:', error);
            this.pingDisplay.textContent = '0 ms';
        }
    }

    async measureDownloadSpeed() {
        const startTime = performance.now();
        let bytesLoaded = 0;
        let lastSpeed = 0;
        
        try {
            // Use a single reliable CDN file
            const fileUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
            
            while (performance.now() - startTime < this.testDuration.download) {
                const response = await fetch(fileUrl + '?t=' + Date.now(), {
                    cache: 'no-store'
                });
                
                const reader = response.body.getReader();
                
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    bytesLoaded += value.length;
                    
                    const currentTime = performance.now();
                    const durationInSeconds = (currentTime - startTime) / 1000;
                    const speedMbps = (bytesLoaded * 8) / (1024 * 1024 * durationInSeconds);
                    
                    lastSpeed = Math.min(speedMbps, this.maxSpeed);
                    this.updateSpeed(lastSpeed);
                    this.downloadSpeedDisplay.textContent = `${lastSpeed.toFixed(2)} Mbps`;
                    this.progressBar.style.width = `${50 + (currentTime - startTime) / 100}%`;
                }
            }
        } catch (error) {
            console.error('Download test failed:', error);
        }
    }

    async measureUploadSpeed() {
        const startTime = performance.now();
        let bytesUploaded = 0;
        let lastSpeed = 0;
        const chunkSize = 50 * 1024; // 50KB chunks for better reliability

        try {
            while (performance.now() - startTime < this.testDuration.upload) {
                const data = new Blob([new ArrayBuffer(chunkSize)]);
                
                await fetch('https://httpbin.org/post', {
                    method: 'POST',
                    body: data
                });
                
                bytesUploaded += chunkSize;
                const currentTime = performance.now();
                const durationInSeconds = (currentTime - startTime) / 1000;
                const speedMbps = (bytesUploaded * 8) / (1024 * 1024 * durationInSeconds);
                
                lastSpeed = Math.min(speedMbps, this.maxSpeed);
                this.updateSpeed(lastSpeed);
                this.uploadSpeedDisplay.textContent = `${lastSpeed.toFixed(2)} Mbps`;
                this.progressBar.style.width = `${75 + (currentTime - startTime) / 100}%`;
            }
        } catch (error) {
            console.error('Upload test failed:', error);
        }
    }

    updateSpeed(speedMbps) {
        const speed = Math.min(speedMbps, this.maxSpeed);
        this.speedDisplay.textContent = speed.toFixed(1);
        this.drawSpeedometer(speed);
    }

    getSpeedColor(percentage) {
        if (percentage < 0.3) return '#ff4444';
        if (percentage < 0.7) return '#ffbb33';
        return '#00C851';
    }

    getSpeedColorEnd(percentage) {
        if (percentage < 0.3) return '#cc0000';
        if (percentage < 0.7) return '#ff8800';
        return '#007E33';
    }
}

// Initialize the speed test
new SpeedTest();