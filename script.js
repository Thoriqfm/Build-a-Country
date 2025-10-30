// Menunggu sampai seluruh halaman HTML selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    
    const groups = [1, 2, 3];
    const types = ['a', 'b', 'c', 'd'];

    // Fungsi Bantuan: Memperbarui Tampilan (UI)
    function updateIndicatorUI(slider, fill, display, value) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        
        // Memastikan nilai berada di antara min dan max
        const clampedValue = Math.max(min, Math.min(max, value));
        const roundedValue = Math.round(clampedValue);

        // 1. Perbarui nilai slider tersembunyi
        slider.value = roundedValue;
        
        // 2. Perbarui tampilan teks angka
        display.textContent = roundedValue;

        // 3. Perbarui tinggi 'fill' (diagram)
        // (nilai - min) / (max - min) menghitung persentase
        const percent = ((roundedValue - min) / (max - min)) * 100;
        fill.style.height = `${percent}%`;
    }

    // Fungsi Bantuan: Menghitung nilai berdasarkan posisi klik/sentuh
    function calculateValueFromEvent(event, track, slider) {
        const rect = track.getBoundingClientRect();
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        // Dapatkan posisi Y, tangani mouse (clientY) dan sentuhan (touches)
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        if (clientY === undefined) return parseFloat(slider.value); // Keluar jika tidak ada data posisi

        // Hitung posisi Y relatif terhadap elemen 'track'
        const relativeY = clientY - rect.top;
        
        // Hitung persentase dari BAWAH (0% di bawah, 100% di atas)
        const percent = (rect.height - relativeY) / rect.height;
        
        // Ubah persentase menjadi nilai antara min dan max
        const value = min + (percent * (max - min));
        
        // Bulatkan ke angka terdekat
        return Math.round(value);
    }

    // Loop untuk setiap grup dan setiap tipe indikator
    groups.forEach(g => {
        types.forEach(i => {
            const sliderId = `g${g}-i-${i}`;
            const displayId = `val-${sliderId}`;
            const trackId = `track-${sliderId}`;
            const fillId = `fill-${sliderId}`;

            const slider = document.getElementById(sliderId);
            const display = document.getElementById(displayId);
            const track = document.getElementById(trackId);
            const fill = document.getElementById(fillId);

            // Pastikan semua elemen ada
            if (!slider || !display || !track || !fill) return;

            // Atur posisi awal berdasarkan nilai 'value' dari HTML
            updateIndicatorUI(slider, fill, display, parseFloat(slider.value));

            let isDragging = false;

            // Fungsi untuk memulai interaksi (klik atau sentuh)
            const handleInteractionStart = (event) => {
                isDragging = true;
                // Mencegah browser memilih teks saat menyeret
                event.preventDefault();
                const newValue = calculateValueFromEvent(event, track, slider);
                updateIndicatorUI(slider, fill, display, newValue);
            };

            // Fungsi saat menggerakkan mouse/jari
            const handleInteractionMove = (event) => {
                if (!isDragging) return; // Hanya jalankan jika sedang diseret
                event.preventDefault();
                const newValue = calculateValueFromEvent(event, track, slider);
                updateIndicatorUI(slider, fill, display, newValue);
            };

            // Fungsi saat melepaskan klik/sentuhan
            const handleInteractionEnd = () => {
                isDragging = false;
            };

            // --- PASANG EVENT LISTENERS ---

            // Mouse events:
            track.addEventListener('mousedown', handleInteractionStart);
            // Dengarkan 'move' & 'up' di seluruh dokumen
            // Ini memungkinkan pengguna menyeret di luar kotak diagram
            document.addEventListener('mousemove', handleInteractionMove);
            document.addEventListener('mouseup', handleInteractionEnd);
            
            // Touch events (untuk perangkat seluler):
            track.addEventListener('touchstart', handleInteractionStart, { passive: false });
            document.addEventListener('touchmove', handleInteractionMove, { passive: false });
            document.addEventListener('touchend', handleInteractionEnd);
        });
    });
});
