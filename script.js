document.addEventListener('DOMContentLoaded', () => {

    const groups = [1, 2, 3];
    const types = ['a', 'b', 'c', 'd'];

    // Fungsi Bantuan: Memperbarui Tampilan (UI)
    function updateIndicatorUI(slider, fill, display, inputField, value) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        // Memastikan nilai berada di antara min dan max
        const clampedValue = Math.max(min, Math.min(max, value));
        const roundedValue = Math.round(clampedValue);

        // 1. Perbarui nilai slider tersembunyi
        slider.value = roundedValue;

        // 2. Perbarui tampilan teks angka
        display.textContent = roundedValue;

        // 3. Perbarui input field
        inputField.value = roundedValue;

        // 4. Perbarui tinggi 'fill' (diagram)
        const percent = ((roundedValue - min) / (max - min)) * 100;
        fill.style.height = `${percent}%`;
    }

    // Fungsi Bantuan: Menghitung nilai berdasarkan posisi klik/sentuh
    function calculateValueFromEvent(event, track, slider) {
        const rect = track.getBoundingClientRect();
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        if (clientY === undefined) return parseFloat(slider.value);

        const relativeY = clientY - rect.top;
        const percent = (rect.height - relativeY) / rect.height;
        const value = min + (percent * (max - min));

        return Math.round(value);
    }

    // Loop untuk setiap grup dan setiap tipe indikator
    groups.forEach(g => {
        types.forEach(i => {
            const sliderId = `g${g}-i-${i}`;
            const displayId = `val-${sliderId}`;
            const trackId = `track-${sliderId}`;
            const fillId = `fill-${sliderId}`;
            const inputId = `input-${sliderId}`;

            const slider = document.getElementById(sliderId);
            const display = document.getElementById(displayId);
            const track = document.getElementById(trackId);
            const fill = document.getElementById(fillId);
            const inputField = document.getElementById(inputId);

            // Pastikan semua elemen ada
            if (!slider || !display || !track || !fill || !inputField) return;

            // Atur posisi awal berdasarkan nilai 'value' dari HTML
            updateIndicatorUI(slider, fill, display, inputField, parseFloat(slider.value));

            let isDragging = false;

            // Fungsi untuk memulai interaksi (klik atau sentuh)
            const handleInteractionStart = (event) => {
                isDragging = true;
                event.preventDefault();
                const newValue = calculateValueFromEvent(event, track, slider);
                updateIndicatorUI(slider, fill, display, inputField, newValue);
            };

            // Fungsi saat menggerakkan mouse/jari
            const handleInteractionMove = (event) => {
                if (!isDragging) return;
                event.preventDefault();
                const newValue = calculateValueFromEvent(event, track, slider);
                updateIndicatorUI(slider, fill, display, inputField, newValue);
            };

            // Fungsi saat melepaskan klik/sentuhan
            const handleInteractionEnd = () => {
                isDragging = false;
            };

            // --- EVENT LISTENERS UNTUK DIAGRAM ---
            track.addEventListener('mousedown', handleInteractionStart);
            document.addEventListener('mousemove', handleInteractionMove);
            document.addEventListener('mouseup', handleInteractionEnd);

            track.addEventListener('touchstart', handleInteractionStart, { passive: false });
            document.addEventListener('touchmove', handleInteractionMove, { passive: false });
            document.addEventListener('touchend', handleInteractionEnd);

            // --- EVENT LISTENERS UNTUK INPUT FIELD ---
            // Update otomatis saat user mengetik (realtime) - DIPERBAIKI
            inputField.addEventListener('input', (e) => {
                let newValue = parseFloat(e.target.value);

                // Jika input adalah angka yang valid (bukan NaN)
                if (!isNaN(newValue)) {
                    // Batasi nilai antara min dan max (0-100)
                    const min = parseFloat(slider.min);
                    const max = parseFloat(slider.max);
                    const clampedValue = Math.max(min, Math.min(max, newValue));

                    // Panggil fungsi update untuk memperbarui semua elemen
                    // Dengan nilai yang sudah dipastikan valid
                    updateIndicatorUI(slider, fill, display, inputField, clampedValue);
                }
                // Jika input bukan angka, tidak lakukan apa-apa (biarkan tampilan lama)
                // atau Anda bisa mengosongkan display dan fill, tergantung kebijakan UI
            });

            // Saat input field kehilangan fokus (blur) - DIPERBAIKI
            inputField.addEventListener('blur', (e) => {
                let newValue = parseFloat(e.target.value);

                // Jika input kosong atau bukan angka, atur ke nilai slider saat ini
                if (isNaN(newValue)) {
                    newValue = parseFloat(slider.value); // Gunakan nilai slider sebagai fallback
                } else {
                    // Jika angka, pastikan tetap dalam batas
                    const min = parseFloat(slider.min);
                    const max = parseFloat(slider.max);
                    newValue = Math.max(min, Math.min(max, newValue));
                }

                // Perbarui semua elemen dengan nilai final
                updateIndicatorUI(slider, fill, display, inputField, newValue);
            });

            // Saat user menekan Enter - DIPERBAIKI
            inputField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    let newValue = parseFloat(e.target.value);

                    // Jika input kosong atau bukan angka, atur ke nilai slider saat ini
                    if (isNaN(newValue)) {
                        newValue = parseFloat(slider.value); // Gunakan nilai slider sebagai fallback
                    } else {
                        // Jika angka, pastikan tetap dalam batas
                        const min = parseFloat(slider.min);
                        const max = parseFloat(slider.max);
                        newValue = Math.max(min, Math.min(max, newValue));
                    }

                    // Perbarui semua elemen dengan nilai final
                    updateIndicatorUI(slider, fill, display, inputField, newValue);
                    e.target.blur(); // Hilangkan focus dari input
                }
            });
        });
    });
});