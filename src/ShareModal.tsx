import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  InstagramLogo, FacebookLogo, WhatsappLogo, 
  ImageSquare, VideoCamera, Users, Star, 
  Newspaper, UsersThree, Storefront, User, Clock, Broadcast 
} from '@phosphor-icons/react';
import { getImageUrl, type DriveFile } from './driveService';

type NetType = 'ig' | 'fb' | 'wz' | null;

interface ShareModalProps {
  photo: DriveFile | null;
  onClose: () => void;
  initialNet?: NetType;
}

const hints: Record<string, Record<string, string>> = {
  ig: {
    default: 'Escolha onde a imagem vai aparecer no Instagram.',
    Feed: 'O post fica no seu perfil permanentemente.',
    Stories: 'Aparece por 24h no topo do feed dos seus seguidores.',
    Reels: 'Ideal para vídeos curtos — mas funciona com imagem também.',
    Close: 'Só seus amigos próximos veem esse stories.',
  },
  fb: {
    default: 'Escolha onde a imagem vai aparecer no Facebook.',
    Feed: 'Aparece na sua linha do tempo e no feed dos amigos.',
    Stories: 'Aparece por 24h para seus amigos e seguidores.',
    Grupos: 'Vai para o grupo selecionado após confirmar.',
    Marketplace: 'Publica como anúncio — ideal para venda de produtos.',
  },
  wz: {
    default: 'A imagem vai direto como arquivo — qualidade original.',
    Conversa: 'Escolha a conversa depois que o WhatsApp abrir.',
    Grupo: 'Selecione o grupo na lista após abrir o app.',
    Status: 'Aparece no seu status por 24h para seus contatos.',
    Canal: 'Broadcast — todos os inscritos recebem.',
  },
};

const btnLabels: Record<string, Record<string, string>> = {
  ig: { Feed:'Postar no Feed', Stories:'Postar nos Stories', Reels:'Postar nos Reels', Close:'Postar no Close Friends' },
  fb: { Feed:'Postar no Feed', Stories:'Postar nos Stories', Grupos:'Enviar ao Grupo', Marketplace:'Publicar no Marketplace' },
  wz: { Conversa:'Enviar na Conversa', Grupo:'Enviar no Grupo', Status:'Postar no Status', Canal:'Postar no Canal' },
};

export default function ShareModal({ photo, onClose, initialNet = null }: ShareModalProps) {
  const [net, setNet] = useState<NetType>(initialNet);
  const [sub, setSub] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const handleSelectNet = (n: NetType) => {
    setNet(n);
    setSub(null);
  };

  const handleSelectSub = (s: string) => {
    setSub(s);
  };

  const doShare = async () => {
    if (!net || !sub || !photo) return;
    setSharing(true);

    try {
      const imageUrl = getImageUrl(photo, 'large');
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${photo.name}.jpg`, { type: blob.type || 'image/jpeg' });

      // App Deep link fallbacks if native share fails or isn't supported
      // Note: sending a File object natively to whatsapp usually works if canShare is true.
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: photo.name });
        onClose();
        return;
      }

      const imgUrl = encodeURIComponent(window.location.href);
      const urls: Record<string, Record<string, string>> = {
        ig: {
          Feed: 'instagram://library',
          Stories: 'instagram://camera',
          Reels: 'instagram://reels_creator',
          Close: 'instagram://camera',
        },
        fb: {
          Feed: 'https://www.facebook.com/sharer/sharer.php?u=' + imgUrl,
          Stories: 'fb://stories/create',
          Grupos: 'https://www.facebook.com/groups/',
          Marketplace: 'https://www.facebook.com/marketplace/create/item',
        },
        wz: {
          Conversa: 'https://wa.me/?text=' + imgUrl,
          Grupo: 'https://wa.me/?text=' + imgUrl,
          Status: 'whatsapp://status',
          Canal: 'https://wa.me/?text=' + imgUrl,
        },
      };

      const target = urls[net]?.[sub];
      if (target) {
        window.open(target, '_blank');
      } else {
        alert("Compartilhamento avançado não suportado no seu dispositivo.");
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Erro ao preparar o compartilhamento.");
    } finally {
      setSharing(false);
    }
  };

  const hintText = net ? (sub ? hints[net][sub] : hints[net].default) : '';
  const btnText = net && sub ? btnLabels[net][sub] : 'Selecione a rede e o destino';
  
  let btnReadyColor = 'bg-[#222] opacity-35 cursor-not-allowed';
  if (net && sub) {
    if (net === 'ig') btnReadyColor = 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]';
    if (net === 'fb') btnReadyColor = 'bg-[#1877F2]';
    if (net === 'wz') btnReadyColor = 'bg-[#25D366]';
  }

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-[480px] bg-[#1a1a1a] rounded-t-[20px] sm:rounded-[20px] pb-[calc(env(safe-area-inset-bottom)+24px)] overflow-hidden shadow-2xl border border-white/10 font-sans"
        >
          {/* Drag Handle */}
          <div className="w-10 h-1.5 bg-[#333] rounded-full mx-auto mt-3 sm:hidden" />

          {/* Thumbnail / Header */}
          <div className="flex items-center gap-3 px-5 pt-4 sm:pt-6">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-[#2a3a5e] to-[#3a5e2a] flex-shrink-0 flex items-center justify-center border border-white/10">
              <img src={getImageUrl(photo, 'thumbnail')} alt={photo.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <p className="text-[15px] font-medium text-[#f0f0f0] truncate max-w-[250px]">{photo.name}</p>
              <span className="text-xs text-[#666] mt-0.5">Imagem · Alta Qualidade</span>
            </div>
          </div>

          <hr className="border-t border-white/10 mt-5" />

          {/* Redes Sociais */}
          <p className="px-5 pt-4 pb-3 text-[11px] font-bold text-zinc-400/80 tracking-widest uppercase">
            Compartilhar em
          </p>
          <div className="flex gap-3 px-5">
            <button 
              onClick={() => handleSelectNet('ig')}
              className={`flex-1 flex flex-col items-center gap-2.5 py-4 px-2 rounded-[18px] border transition-all bg-zinc-900/50 hover:bg-zinc-800 active:scale-95 ${net === 'ig' ? 'border-[#D62976] shadow-[0_0_15px_rgba(214,41,118,0.15)] bg-zinc-800/80' : 'border-white/10'}`}
            >
              <InstagramLogo size={32} weight={net === 'ig' ? "fill" : "regular"} className={net === 'ig' ? "text-[#D62976]" : "text-zinc-400"} />
              <span className={`text-[13px] font-medium ${net === 'ig' ? 'text-white' : 'text-zinc-400'}`}>Instagram</span>
            </button>

            <button 
              onClick={() => handleSelectNet('fb')}
              className={`flex-1 flex flex-col items-center gap-2.5 py-4 px-2 rounded-[18px] border transition-all bg-zinc-900/50 hover:bg-zinc-800 active:scale-95 ${net === 'fb' ? 'border-[#1877F2] shadow-[0_0_15px_rgba(24,119,242,0.15)] bg-zinc-800/80' : 'border-white/10'}`}
            >
              <FacebookLogo size={32} weight={net === 'fb' ? "fill" : "regular"} className={net === 'fb' ? "text-[#1877F2]" : "text-zinc-400"} />
              <span className={`text-[13px] font-medium ${net === 'fb' ? 'text-white' : 'text-zinc-400'}`}>Facebook</span>
            </button>

            <button 
              onClick={() => handleSelectNet('wz')}
              className={`flex-1 flex flex-col items-center gap-2.5 py-4 px-2 rounded-[18px] border transition-all bg-zinc-900/50 hover:bg-zinc-800 active:scale-95 ${net === 'wz' ? 'border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.15)] bg-zinc-800/80' : 'border-white/10'}`}
            >
              <WhatsappLogo size={32} weight={net === 'wz' ? "fill" : "regular"} className={net === 'wz' ? "text-[#25D366]" : "text-zinc-400"} />
              <span className={`text-[13px] font-medium ${net === 'wz' ? 'text-white' : 'text-zinc-400'}`}>WhatsApp</span>
            </button>
          </div>

          {/* Sub-Options */}
          <div className="px-5 mt-2">
            <AnimatePresence mode="wait">
              {net && (
                <motion.div 
                  key={net}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <hr className="border-t border-white/10 mt-5" />
                  <p className="pt-4 pb-3 text-[11px] font-bold text-zinc-400/80 tracking-widest uppercase">
                    {net === 'wz' ? 'Como quer enviar?' : 'Onde quer postar?'}
                  </p>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {net === 'ig' && [
                      { id: 'Feed', icon: <ImageSquare size={24} />, desc: 'no perfil' },
                      { id: 'Stories', icon: <VideoCamera size={24} />, desc: 'some 24h' },
                      { id: 'Reels', icon: <VideoCamera size={24} />, desc: 'vídeos' },
                      { id: 'Close', icon: <Star size={24} />, desc: 'amigos' }
                    ].map(item => (
                      <button key={item.id} onClick={() => handleSelectSub(item.id)} className={`flex flex-col justify-center items-center gap-1.5 py-3 px-1 rounded-[14px] border transition-all bg-zinc-900/50 hover:bg-zinc-800 active:scale-95 ${sub === item.id ? 'border-[#D62976] shadow-[0_0_15px_rgba(214,41,118,0.15)] bg-zinc-800/80' : 'border-white/10'}`}>
                        <div className={sub === item.id ? "text-[#D62976]" : "text-zinc-400"}>{item.icon}</div>
                        <span className={`text-xs font-semibold text-center mt-0.5 ${sub === item.id ? 'text-white' : 'text-zinc-300'}`}>{item.id}</span>
                        <span className="text-[10px] text-zinc-500 text-center leading-tight">{item.desc}</span>
                      </button>
                    ))}

                    {net === 'fb' && [
                      { id: 'Feed', icon: <Newspaper size={24} />, desc: 'tempo real' },
                      { id: 'Stories', icon: <VideoCamera size={24} />, desc: 'some 24h' },
                      { id: 'Grupos', icon: <UsersThree size={24} />, desc: 'comunidade' },
                      { id: 'Loja', icon: <Storefront size={24} />, desc: 'marketplace' }
                    ].map(item => (
                      <button key={item.id} onClick={() => handleSelectSub(item.id)} className={`flex flex-col justify-center items-center gap-1.5 py-3 px-1 rounded-[14px] border transition-all bg-zinc-900/50 hover:bg-zinc-800 active:scale-95 ${sub === item.id ? 'border-[#1877F2] shadow-[0_0_15px_rgba(24,119,242,0.15)] bg-zinc-800/80' : 'border-white/10'}`}>
                        <div className={sub === item.id ? "text-[#1877F2]" : "text-zinc-400"}>{item.icon}</div>
                        <span className={`text-xs font-semibold text-center mt-0.5 ${sub === item.id ? 'text-white' : 'text-zinc-300'}`}>{item.id}</span>
                        <span className="text-[10px] text-zinc-500 text-center leading-tight">{item.desc}</span>
                      </button>
                    ))}

                    {net === 'wz' && [
                      { id: 'Conversa', icon: <User size={24} />, desc: '1 a 1' },
                      { id: 'Grupo', icon: <Users size={24} />, desc: 'vários' },
                      { id: 'Status', icon: <Clock size={24} />, desc: 'some 24h' },
                      { id: 'Canal', icon: <Broadcast size={24} />, desc: 'broadcast' }
                    ].map(item => (
                      <button key={item.id} onClick={() => handleSelectSub(item.id)} className={`flex flex-col justify-center items-center gap-1.5 py-3 px-1 rounded-[14px] border transition-all bg-zinc-900/50 hover:bg-zinc-800 active:scale-95 ${sub === item.id ? 'border-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.15)] bg-zinc-800/80' : 'border-white/10'}`}>
                        <div className={sub === item.id ? "text-[#25D366]" : "text-zinc-400"}>{item.icon}</div>
                        <span className={`text-xs font-semibold text-center mt-0.5 ${sub === item.id ? 'text-white' : 'text-zinc-300'}`}>{item.id}</span>
                        <span className="text-[10px] text-zinc-500 text-center leading-tight">{item.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-zinc-900/50 rounded-[14px] border border-white/5 text-xs font-medium text-zinc-400 leading-relaxed text-center shadow-inner">
                    {hintText}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="px-5 pt-5 pb-2">
            <button 
              onClick={doShare}
              disabled={!net || !sub || sharing}
              className={`w-full py-4 rounded-full text-[16px] font-bold flex items-center justify-center transition-all ${net && sub ? 'active:scale-[0.98] text-white shadow-xl' : 'bg-zinc-800/80 text-zinc-500 border border-white/5 cursor-not-allowed opacity-70'} ${net && sub ? btnReadyColor : ''} ${sharing ? 'opacity-80' : ''}`}
            >
              {sharing ? "Processando..." : btnText}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
