import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Ticket, DownloadSimple, Link as LinkIcon, InstagramLogo, FacebookLogo, WhatsappLogo, Check } from '@phosphor-icons/react'
import { fetchDriveContents, getImageUrl, type TabData, type DriveFile } from './driveService'
import { Spotlights, Sparkles } from './CircusEffects'
import ShareModal from './ShareModal'

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('')
  const [tabs, setTabs] = useState<TabData[]>()
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<DriveFile | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [visibleLimit, setVisibleLimit] = useState(12)
  const [shareSheetOpen, setShareSheetOpen] = useState(false)
  const [shareTarget, setShareTarget] = useState<'ig' | 'fb' | 'wz' | null>(null)

  const openShare = (target: 'ig' | 'fb' | 'wz') => {
    setShareTarget(target);
    setShareSheetOpen(true);
  }

  useEffect(() => {
    async function loadData() {
      const data = await fetchDriveContents();
      setTabs(data);
      if (data.length > 0) setActiveTab(data[0].id);
      setLoading(false);
    }
    loadData();
    setVisibleLimit(12);
  }, [activeTab]);


  const handleDownload = async (photo: DriveFile) => {
    try {
      setDownloading(true);
      const imageUrl = getImageUrl(photo, 'original');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `niver-do-cris-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar a imagem.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = (photo: DriveFile) => {
    const imageUrl = getImageUrl(photo, 'large');
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTab = tabs?.find(t => t.id === activeTab);

  return (
    <div className="min-h-[100dvh] w-full font-sans selection:bg-[#f4a261]/30 pb-20 relative overflow-hidden">
      
      {/* Background Lighting & Magic Effects */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_#d62828_0%,_transparent_70%)] opacity-40 pointer-events-none z-0" />
      <Spotlights />
      <Sparkles />

      <header className="relative max-w-[1400px] mx-auto px-6 py-16 md:py-24 w-full flex flex-col items-center justify-center gap-10 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex flex-col items-center text-center relative z-10"
        >
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
          <div className="flex items-center gap-3 mb-6 text-[#f4a261] bg-[#d62828]/20 px-5 py-2 rounded-full border border-[#d62828]/50 backdrop-blur-md shadow-[0_0_20px_rgba(214,40,40,0.3)]">
            <Ticket weight="fill" size={20} />
            <span className="font-bold tracking-widest text-sm uppercase">O Maior Show da Terra</span>
            <Ticket weight="fill" size={20} />
          </div>
          <h1 className="text-[5.5rem] md:text-[9rem] font-black tracking-tighter leading-[0.85] text-gold-gradient uppercase">
            Circo <br/>
            <span className="text-white filter-none drop-shadow-none">do Cris.</span>
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-zinc-300 font-light max-w-[45ch] leading-relaxed">
            Bem-vindo ao espetáculo dos 50 anos! Uma vida de magia, alegria e momentos inesquecíveis.
          </p>
        </motion.div>

        {!loading && tabs && tabs.length > 0 && (
          <motion.nav 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
            className="flex items-center gap-2 p-2.5 rounded-full liquid-glass overflow-x-auto max-w-full no-scrollbar snap-x mt-4"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-8 py-3.5 rounded-full text-base font-bold whitespace-nowrap transition-colors duration-300 snap-center outline-none ${
                    isActive ? "text-[#1f0b0b]" : "text-zinc-200 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-[#ffe066] to-[#f4a261] rounded-full z-0 shadow-[0_0_20px_rgba(244,162,97,0.5)]"
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    />
                  )}
                  <span className="relative z-10 select-none">{tab.label}</span>
                </button>
              )
            })}
          </motion.nav>
        )}
        </motion.div>
      </header>

      <main className="relative max-w-[1400px] mx-auto px-6 w-full mt-8">
        {loading ? (
          <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-6">
            <div className="w-20 h-20 border-4 border-white/10 border-t-[#f4a261] rounded-full animate-spin shadow-[0_0_30px_rgba(244,162,97,0.3)]" />
            <p className="text-[#f4a261] font-mono text-sm tracking-[0.3em] uppercase mt-2">ABRINDO AS CORTINAS...</p>
          </div>
        ) : currentTab && currentTab.photos.length > 0 ? (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center md:justify-start mb-10 px-4"
            >
              <div className="flex items-center gap-3 px-6 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                <span className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] md:text-xs font-black">
                  {currentTab.photos.length} Momentos <span className="text-[#f4a261]">Mágicos</span>
                </span>
                <div className="w-1 h-1 rounded-full bg-[#f4a261]/40" />
                <span className="text-zinc-600 text-[10px] md:text-xs font-medium lowercase">Nesta Galeria</span>
              </div>
            </motion.div>

            <motion.div 
              key={currentTab.id}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 auto-rows-[200px] md:auto-rows-[400px]"
          >
            {currentTab.photos.slice(0, visibleLimit).map((photo, i) => (
              <motion.div 
                key={photo.id}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
                }}
                whileHover={{ y: -12, scale: 1.03, rotate: i % 2 === 0 ? 1.5 : -1.5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPhoto(photo)}
                className="relative cursor-pointer rounded-2xl overflow-hidden bg-zinc-900 group border-4 border-white shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-10"
              >
                <img 
                  src={getImageUrl(photo, 'thumbnail')} 
                  alt={photo.name} 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f0b0b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                
                {/* Magic Glint Sweep */}
                <div className="absolute inset-0 -translate-x-[150%] group-hover:animate-[glint_0.8s_ease-in-out_forwards] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] pointer-events-none z-20 mix-blend-overlay" />
              </motion.div>
            ))}
            </motion.div>

            {visibleLimit < currentTab.photos.length && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-12 mb-20"
              >
                <button
                  onClick={() => setVisibleLimit(prev => prev + 12)}
                  className="group relative px-10 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-[#f4a261] font-black uppercase tracking-[0.3em] text-xs hover:bg-[#f4a261] hover:text-[#1f0b0b] transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(244,162,97,0.4)] hover:-translate-y-1 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Carregar Mais
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f4a261] group-hover:bg-[#1f0b0b] transition-colors" />
                    Momentos
                  </span>
                  
                  {/* Internal Glow on Hover */}
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/20 to-transparent transition-opacity duration-500" />
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="w-full min-h-[300px] liquid-glass rounded-[2.5rem] flex items-center justify-center border border-white/10">
             <p className="text-zinc-400 text-xl font-light">O picadeiro está vazio nesta categoria.</p>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f0b0b]/90 p-4 md:p-10"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Top Bar for Close */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-6 right-6 md:top-10 md:right-10 z-50"
            >
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-[#d62828] transition-all backdrop-blur-xl border border-white/20 hover:scale-110 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                <X weight="bold" size={32} />
              </button>
            </motion.div>

            {/* Central Photo - Immersive */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="relative w-full h-full max-w-[95vw] md:max-w-[85vw] max-h-[75vh] md:max-h-[85vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={getImageUrl(selectedPhoto, 'large')} 
                alt={selectedPhoto.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(31,11,11,1)]"
              />
            </motion.div>

            {/* Bottom Floating Action Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 25 }}
              className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full px-4 md:px-6 pointer-events-none"
            >
              <div 
                className="flex flex-wrap justify-center items-center gap-2 p-2 bg-black/50 backdrop-blur-2xl border border-white/20 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                
                {/* Download Button */}
                <motion.button 
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(selectedPhoto)}
                  disabled={downloading}
                  className="flex items-center justify-center gap-2 bg-white/10 text-white py-2.5 px-4 md:px-5 rounded-full font-bold text-xs md:text-sm transition-all disabled:opacity-50"
                >
                  <DownloadSimple weight="bold" size={18} />
                  <span className="hidden sm:inline">{downloading ? "BAIXANDO" : "SALVAR"}</span>
                </motion.button>

                {/* Vertical Divider */}
                <div className="w-[1px] h-6 bg-white/20 mx-1"></div>

                {/* Direct Share Icons */}
                <div className="flex items-center gap-1.5 md:gap-2">
                  <motion.button 
                    whileHover={{ y: -4, scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openShare('wz')}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#25D366] text-white shadow-lg"
                  >
                    <WhatsappLogo weight="fill" size={22} />
                  </motion.button>

                  <motion.button 
                    whileHover={{ y: -4, scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openShare('ig')}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-lg"
                  >
                    <InstagramLogo weight="fill" size={22} />
                  </motion.button>

                  <motion.button 
                    whileHover={{ y: -4, scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openShare('fb')}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-[#1877F2] text-white shadow-lg"
                  >
                    <FacebookLogo weight="fill" size={22} />
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopyLink(selectedPhoto)}
                    className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
                  >
                    {copied ? <Check weight="bold" size={18} className="text-[#25D366]" /> : <LinkIcon weight="bold" size={18} />}
                  </motion.button>
                </div>
              </div>
              
              <p className="text-[#f4a261]/80 text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase filter drop-shadow-md text-center mt-1">
                SALVE OU COMPARTILHE A MÁGICA
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {shareSheetOpen && (
        <ShareModal photo={selectedPhoto} initialNet={shareTarget} onClose={() => setShareSheetOpen(false)} />
      )}
    </div>
  )
}
