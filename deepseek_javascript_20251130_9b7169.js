// Data aplikasi
const App = {
    photos: [],
    songs: [],
    wishlist: [],
    currentSongIndex: 0,
    isPlaying: false,
    audioPlayer: new Audio(),
    
    // Inisialisasi aplikasi
    init() {
        this.createHearts();
        this.setupEventListeners();
        this.loadData();
        this.hideLoading();
    },
    
    // Membuat animasi hati
    createHearts() {
        const heartsContainer = document.getElementById('heartsContainer');
        const heartCount = 15;
        
        for (let i = 0; i < heartCount; i++) {
            const heart = document.createElement('div');
            heart.classList.add('heart');
            heart.innerHTML = '❤️';
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDelay = Math.random() * 5 + 's';
            heart.style.fontSize = (Math.random() * 20 + 10) + 'px';
            heartsContainer.appendChild(heart);
        }
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Navigasi
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });
        
        // Upload foto
        document.getElementById('photoUploadArea').addEventListener('click', () => {
            document.getElementById('photoUpload').click();
        });
        
        document.getElementById('photoUpload').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });
        
        // Upload musik
        document.getElementById('musicUploadArea').addEventListener('click', () => {
            document.getElementById('musicUpload').click();
        });
        
        document.getElementById('musicUpload').addEventListener('change', (e) => {
            this.handleMusicUpload(e);
        });
        
        // Kontrol musik
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlayback());
        document.getElementById('prevBtn').addEventListener('click', () => this.previousSong());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSong());
        
        // Progress bar
        document.querySelector('.progress-bar').addEventListener('click', (e) => {
            this.seekAudio(e);
        });
        
        // Wishlist
        document.getElementById('addWishBtn').addEventListener('click', () => {
            this.addWish();
        });
        
        // Drag and drop
        this.setupDragAndDrop();
        
        // Audio events
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.nextSong());
    },
    
    // Handle navigasi
    handleNavigation(link) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetElement.offsetTop - 20,
            behavior: 'smooth'
        });
    },
    
    // Handle upload foto
    handlePhotoUpload(e) {
        const files = e.target.files;
        
        for (let file of files) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                this.photos.push({
                    url: event.target.result,
                    caption: `Foto ${this.photos.length + 1}`,
                    timestamp: new Date().toISOString()
                });
                
                this.renderGallery();
                this.saveData();
                this.showNotification('Foto berhasil diunggah!', 'success');
            };
            
            reader.readAsDataURL(file);
        }
        
        e.target.value = '';
    },
    
    // Handle upload musik
    handleMusicUpload(e) {
        const files = e.target.files;
        
        for (let file of files) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const fileName = file.name.replace(/\.[^/.]+$/, "");
                
                this.songs.push({
                    url: event.target.result,
                    title: fileName,
                    artist: "Artis",
                    timestamp: new Date().toISOString()
                });
                
                this.renderPlaylist();
                this.saveData();
                this.showNotification('Lagu berhasil diunggah!', 'success');
                
                if (this.songs.length === 1) {
                    this.playSong(0);
                }
            };
            
            reader.readAsDataURL(file);
        }
        
        e.target.value = '';
    },
    
    // Setup drag and drop
    setupDragAndDrop() {
        const photoUploadArea = document.getElementById('photoUploadArea');
        
        photoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoUploadArea.style.backgroundColor = 'rgba(255,255,255,0.2)';
        });
        
        photoUploadArea.addEventListener('dragleave', () => {
            photoUploadArea.style.backgroundColor = '';
        });
        
        photoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            photoUploadArea.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('photoUpload').files = files;
                const event = new Event('change');
                document.getElementById('photoUpload').dispatchEvent(event);
            }
        });
    },
    
    // Render galeri foto
    renderGallery() {
        const galleryContainer = document.getElementById('photoGallery');
        galleryContainer.innerHTML = '';
        
        if (this.photos.length === 0) {
            galleryContainer.innerHTML = `
                <div style="text-align:center; grid-column:1/-1; padding: 2rem;">
                    <i class="fas fa-images" style="font-size: 3rem; color: var(--pink); margin-bottom: 1rem;"></i>
                    <p>Belum ada foto. Unggah foto pertama Anda!</p>
                </div>
            `;
            return;
        }
        
        this.photos.forEach((photo, index) => {
            const photoFrame = document.createElement('div');
            photoFrame.classList.add('photo-frame');
            
            photoFrame.innerHTML = `
                <div class="photo-actions">
                    <button class="photo-btn delete-photo" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <img src="${photo.url}" alt="${photo.caption}" loading="lazy">
                <div class="photo-caption">${photo.caption}</div>
            `;
            
            galleryContainer.appendChild(photoFrame);
        });
        
        // Event listeners untuk tombol hapus
        document.querySelectorAll('.delete-photo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                this.deletePhoto(index);
            });
        });
    },
    
    // Hapus foto
    deletePhoto(index) {
        if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
            this.photos.splice(index, 1);
            this.renderGallery();
            this.saveData();
            this.showNotification('Foto berhasil dihapus', 'success');
        }
    },
    
    // Render playlist
    renderPlaylist() {
        const playlistContainer = document.getElementById('playlist');
        playlistContainer.innerHTML = '';
        
        if (this.songs.length === 0) {
            playlistContainer.innerHTML = `
                <div style="text-align:center; padding: 2rem;">
                    <i class="fas fa-music" style="font-size: 3rem; color: var(--pink); margin-bottom: 1rem;"></i>
                    <p>Belum ada lagu. Unggah lagu pertama Anda!</p>
                </div>
            `;
            return;
        }
        
        this.songs.forEach((song, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.classList.add('playlist-item');
            if (index === this.currentSongIndex) {
                playlistItem.classList.add('active');
            }
            
            playlistItem.innerHTML = `
                <div>
                    <div>${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <button class="delete-song" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            playlistItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-song')) {
                    this.playSong(index);
                }
            });
            
            playlistContainer.appendChild(playlistItem);
        });
        
        // Event listeners untuk tombol hapus lagu
        document.querySelectorAll('.delete-song').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                this.deleteSong(index);
            });
        });
    },
    
    // Hapus lagu
    deleteSong(index) {
        if (confirm('Apakah Anda yakin ingin menghapus lagu ini?')) {
            this.songs.splice(index, 1);
            
            if (this.currentSongIndex >= index && this.currentSongIndex > 0) {
                this.currentSongIndex--;
            }
            
            if (this.songs.length === 0) {
                this.stopPlayback();
            } else if (this.currentSongIndex < this.songs.length) {
                this.playSong(this.currentSongIndex);
            } else {
                this.currentSongIndex = 0;
                this.playSong(this.currentSongIndex);
            }
            
            this.renderPlaylist();
            this.saveData();
            this.showNotification('Lagu berhasil dihapus', 'success');
        }
    },
    
    // Putar lagu
    playSong(index) {
        if (this.songs.length === 0) return;
        
        this.currentSongIndex = index;
        const song = this.songs[this.currentSongIndex];
        
        this.audioPlayer.src = song.url;
        this.audioPlayer.play();
        this.isPlaying = true;
        
        document.getElementById('currentSongTitle').textContent = song.title;
        document.getElementById('currentSongArtist').textContent = song.artist;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i>';
        
        this.renderPlaylist();
    },
    
    // Toggle play/pause
    togglePlayback() {
        if (this.songs.length === 0) return;
        
        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.isPlaying = false;
            document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i>';
        } else {
            if (this.audioPlayer.src) {
                this.audioPlayer.play();
            } else {
                this.playSong(this.currentSongIndex);
            }
            this.isPlaying = true;
            document.getElementById('playBtn').innerHTML = '<i class="fas fa-pause"></i>';
        }
    },
    
    // Lagu sebelumnya
    previousSong() {
        if (this.songs.length === 0) return;
        
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.playSong(this.currentSongIndex);
    },
    
    // Lagu berikutnya
    nextSong() {
        if (this.songs.length === 0) return;
        
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.playSong(this.currentSongIndex);
    },
    
    // Stop pemutaran
    stopPlayback() {
        this.audioPlayer.pause();
        this.isPlaying = false;
        document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('currentSongTitle').textContent = 'Pilih lagu dari playlist';
        document.getElementById('currentSongArtist').textContent = '-';
        document.getElementById('currentTime').textContent = '0:00';
        document.getElementById('duration').textContent = '0:00';
        document.getElementById('progressBar').style.width = '0%';
    },
    
    // Update progress bar
    updateProgress() {
        const currentTime = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration;
        
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            document.getElementById('progressBar').style.width = `${progressPercent}%`;
            
            document.getElementById('currentTime').textContent = this.formatTime(currentTime);
            document.getElementById('duration').textContent = this.formatTime(duration);
        }
    },
    
    // Seek audio
    seekAudio(e) {
        if (this.songs.length === 0) return;
        
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX;
        const progressBarWidth = progressBar.offsetWidth;
        const percentage = clickPosition / progressBarWidth;
        
        this.audioPlayer.currentTime = percentage * this.audioPlayer.duration;
    },
    
    // Format waktu
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    },
    
    // Render wishlist
    renderWishlist() {
        const wishlistContainer = document.getElementById('wishlistContainer');
        wishlistContainer.innerHTML = '';
        
        // Kelompokkan wish berdasarkan kategori
        const categories = {};
        this.wishlist.forEach(wish => {
            if (!categories[wish.category]) {
                categories[wish.category] = [];
            }
            categories[wish.category].push(wish);
        });
        
        // Render setiap kategori
        for (const category in categories) {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('wish-category');
            
            let categoryHTML = `<h3>${category}</h3>`;
            
            categories[category].forEach(wish => {
                const checkedClass = wish.checked ? 'checked' : '';
                
                categoryHTML += `
                    <div class="wish-item ${checkedClass}" data-id="${wish.id}">
                        <div class="wish-checkbox">
                            <input type="checkbox" id="wish-${wish.id}" ${wish.checked ? 'checked' : ''}>
                            <label for="wish-${wish.id}"></label>
                        </div>
                        <div class="wish-details">
                            <div class="wish-title">${wish.title}</div>
                            <div class="wish-desc">${wish.description}</div>
                        </div>
                        <div class="wish-actions">
                            <button class="wish-btn delete-wish" data-id="${wish.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            categoryDiv.innerHTML = categoryHTML;
            wishlistContainer.appendChild(categoryDiv);
        }
        
        // Event listeners
        document.querySelectorAll('.wish-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const wishId = parseInt(e.target.closest('.wish-item').getAttribute('data-id'));
                this.toggleWishStatus(wishId);
            });
        });
        
        document.querySelectorAll('.delete-wish').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const wishId = parseInt(btn.getAttribute('data-id'));
                this.deleteWish(wishId);
            });
        });
    },
    
    // Toggle status wish
    toggleWishStatus(wishId) {
        const wish = this.wishlist.find(w => w.id === wishId);
        if (wish) {
            wish.checked = !wish.checked;
            this.renderWishlist();
            this.saveData();
        }
    },
    
    // Hapus wish
    deleteWish(wishId) {
        if (confirm('Apakah Anda yakin ingin menghapus wish ini?')) {
            this.wishlist = this.wishlist.filter(w => w.id !== wishId);
            this.renderWishlist();
            this.saveData();
            this.showNotification('Wish berhasil dihapus', 'success');
        }
    },
    
    // Tambah wish baru
    addWish() {
        const title = document.getElementById('wishTitle').value.trim();
        const category = document.getElementById('wishCategory').value.trim();
        const description = document.getElementById('wishDesc').value.trim();
        
        if (title && category && description) {
            const newId = this.wishlist.length > 0 ? Math.max(...this.wishlist.map(w => w.id)) + 1 : 1;
            
            this.wishlist.push({
                id: newId,
                title,
                category,
                description,
                checked: false,
                timestamp: new Date().toISOString()
            });
            
            this.renderWishlist();
            this.saveData();
            
            // Reset form
            document.getElementById('wishTitle').value = '';
            document.getElementById('wishCategory').value = '';
            document.getElementById('wishDesc').value = '';
            
            this.showNotification('Wish berhasil ditambahkan!', 'success');
        } else {
            this.showNotification('Harap isi semua field!', 'error');
        }
    },
    
    // Load data dari localStorage
    loadData() {
        const savedPhotos = localStorage.getItem('ameliaWiliPhotos');
        const savedSongs = localStorage.getItem('ameliaWiliSongs');
        const savedWishlist = localStorage.getItem('ameliaWiliWishlist');
        
        if (savedPhotos) this.photos = JSON.parse(savedPhotos);
        if (savedSongs) this.songs = JSON.parse(savedSongs);
        if (savedWishlist) this.wishlist = JSON.parse(savedWishlist);
        
        // Data sample jika tidak ada data
        if (this.wishlist.length === 0) {
            this.wishlist = [
                { id: 1, title: "Bali, Indonesia", category: "Destinasi Liburan", description: "Menikmati sunset romantis di pantai Kuta", checked: false },
                { id: 2, title: "Paris, Prancis", category: "Destinasi Liburan", description: "Melihat Menara Eiffel dan berjalan di tepi Sungai Seine", checked: false },
                { id: 3, title: "Kamera Mirrorless", category: "Barang Impian", description: "Untuk mengabadikan momen-momen indah kita", checked: false },
                { id: 4, title: "Kelas Memasak Bersama", category: "Pengalaman Bersama", description: "Belajar memasak hidangan favorit berdua", checked: false }
            ];
        }
        
        this.renderGallery();
        this.renderPlaylist();
        this.renderWishlist();
    },
    
    // Save data ke localStorage
    saveData() {
        localStorage.setItem('ameliaWiliPhotos', JSON.stringify(this.photos));
        localStorage.setItem('ameliaWiliSongs', JSON.stringify(this.songs));
        localStorage.setItem('ameliaWiliWishlist', JSON.stringify(this.wishlist));
    },
    
    // Tampilkan notifikasi
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;
        
        setTimeout(() => {
            notification.className = 'notification';
        }, 3000);
    },
    
    // Sembunyikan loading
    hideLoading() {
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }
};

// Inisialisasi aplikasi ketika DOM siap
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});