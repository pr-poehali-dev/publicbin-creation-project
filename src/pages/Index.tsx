import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/0faf505c-400d-47c3-b94e-eff3015e9f7a';

interface Comment {
  id: number;
  username: string;
  content: string;
  created_at: string;
}

interface Pin {
  id: number;
  title: string;
  description: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments?: Comment[];
}

const translations = {
  en: {
    appName: 'PublicBin',
    home: 'Home',
    create: 'Create',
    favorites: 'Favorites',
    settings: 'Settings',
    language: 'Language',
    allPins: 'All Pins',
    favoritePins: 'Favorite Pins',
    noFavorites: 'No favorites yet',
    createPin: 'Create New Pin',
    title: 'Title',
    titlePlaceholder: 'Pin title (optional)',
    description: 'Description',
    descriptionPlaceholder: 'Short description (optional)',
    pasteOrUpload: 'Paste your text or upload a .txt file',
    uploadFile: 'Upload .txt file',
    publish: 'Publish!',
    copy: 'Copy',
    raw: 'RAW',
    copied: 'Copied to clipboard!',
    published: 'Pin published successfully!',
    error: 'An error occurred',
    noContent: 'Please enter some content',
    likes: 'likes',
    comments: 'Comments',
    addComment: 'Add comment',
    username: 'Username',
    usernamePlaceholder: 'Your name',
    commentPlaceholder: 'Write a comment...',
    postComment: 'Post',
    search: 'Search pins...',
    sortNewest: 'Newest',
    sortOldest: 'Oldest'
  },
  ru: {
    appName: 'PublicBin',
    home: 'Главная',
    create: 'Создать',
    favorites: 'Избранное',
    settings: 'Настройки',
    language: 'Язык',
    allPins: 'Все пины',
    favoritePins: 'Избранные пины',
    noFavorites: 'Пока нет избранных',
    createPin: 'Создать новый пин',
    title: 'Заголовок',
    titlePlaceholder: 'Заголовок пина (необязательно)',
    description: 'Описание',
    descriptionPlaceholder: 'Краткое описание (необязательно)',
    pasteOrUpload: 'Вставьте текст или загрузите .txt файл',
    uploadFile: 'Загрузить .txt',
    publish: 'Опубликовать!',
    copy: 'Копировать',
    raw: 'RAW',
    copied: 'Скопировано!',
    published: 'Пин успешно опубликован!',
    error: 'Произошла ошибка',
    noContent: 'Пожалуйста, введите текст',
    likes: 'лайков',
    comments: 'Комментарии',
    addComment: 'Добавить комментарий',
    username: 'Имя',
    usernamePlaceholder: 'Ваше имя',
    commentPlaceholder: 'Напишите комментарий...',
    postComment: 'Отправить',
    search: 'Поиск пинов...',
    sortNewest: 'Новые',
    sortOldest: 'Старые'
  },
  ar: {
    appName: 'PublicBin',
    home: 'الرئيسية',
    create: 'إنشاء',
    favorites: 'المفضلة',
    settings: 'الإعدادات',
    language: 'اللغة',
    allPins: 'جميع الدبابيس',
    favoritePins: 'الدبابيس المفضلة',
    noFavorites: 'لا توجد مفضلات بعد',
    createPin: 'إنشاء دبوس جديد',
    title: 'العنوان',
    titlePlaceholder: 'عنوان الدبوس (اختياري)',
    description: 'الوصف',
    descriptionPlaceholder: 'وصف مختصر (اختياري)',
    pasteOrUpload: 'الصق النص أو قم بتحميل ملف .txt',
    uploadFile: 'تحميل .txt',
    publish: 'نشر!',
    copy: 'نسخ',
    raw: 'RAW',
    copied: 'تم النسخ!',
    published: 'تم نشر الدبوس بنجاح!',
    error: 'حدث خطأ',
    noContent: 'الرجاء إدخال بعض المحتوى',
    likes: 'إعجابات',
    comments: 'التعليقات',
    addComment: 'إضافة تعليق',
    username: 'الاسم',
    usernamePlaceholder: 'اسمك',
    commentPlaceholder: 'اكتب تعليقاً...',
    postComment: 'إرسال',
    search: 'البحث عن دبابيس...',
    sortNewest: 'الأحدث',
    sortOldest: 'الأقدم'
  },
  de: {
    appName: 'PublicBin',
    home: 'Startseite',
    create: 'Erstellen',
    favorites: 'Favoriten',
    settings: 'Einstellungen',
    language: 'Sprache',
    allPins: 'Alle Pins',
    favoritePins: 'Favoriten Pins',
    noFavorites: 'Noch keine Favoriten',
    createPin: 'Neuen Pin erstellen',
    title: 'Titel',
    titlePlaceholder: 'Pin-Titel (optional)',
    description: 'Beschreibung',
    descriptionPlaceholder: 'Kurze Beschreibung (optional)',
    pasteOrUpload: 'Text einfügen oder .txt-Datei hochladen',
    uploadFile: '.txt hochladen',
    publish: 'Veröffentlichen!',
    copy: 'Kopieren',
    raw: 'RAW',
    copied: 'In Zwischenablage kopiert!',
    published: 'Pin erfolgreich veröffentlicht!',
    error: 'Ein Fehler ist aufgetreten',
    noContent: 'Bitte geben Sie Inhalt ein',
    likes: 'Likes',
    comments: 'Kommentare',
    addComment: 'Kommentar hinzufügen',
    username: 'Name',
    usernamePlaceholder: 'Ihr Name',
    commentPlaceholder: 'Kommentar schreiben...',
    postComment: 'Senden',
    search: 'Pins suchen...',
    sortNewest: 'Neueste',
    sortOldest: 'Älteste'
  },
  zh: {
    appName: 'PublicBin',
    home: '首页',
    create: '创建',
    favorites: '收藏',
    settings: '设置',
    language: '语言',
    allPins: '所有贴子',
    favoritePins: '收藏的贴子',
    noFavorites: '暂无收藏',
    createPin: '创建新贴子',
    title: '标题',
    titlePlaceholder: '贴子标题（可选）',
    description: '描述',
    descriptionPlaceholder: '简短描述（可选）',
    pasteOrUpload: '粘贴文本或上传 .txt 文件',
    uploadFile: '上传 .txt',
    publish: '发布！',
    copy: '复制',
    raw: 'RAW',
    copied: '已复制！',
    published: '贴子发布成功！',
    error: '发生错误',
    noContent: '请输入内容',
    likes: '点赞',
    comments: '评论',
    addComment: '添加评论',
    username: '用户名',
    usernamePlaceholder: '你的名字',
    commentPlaceholder: '写下评论...',
    postComment: '发送',
    search: '搜索贴子...',
    sortNewest: '最新',
    sortOldest: '最旧'
  },
  ja: {
    appName: 'PublicBin',
    home: 'ホーム',
    create: '作成',
    favorites: 'お気に入り',
    settings: '設定',
    language: '言語',
    allPins: 'すべてのピン',
    favoritePins: 'お気に入りのピン',
    noFavorites: 'まだお気に入りがありません',
    createPin: '新しいピンを作成',
    title: 'タイトル',
    titlePlaceholder: 'ピンのタイトル（オプション）',
    description: '説明',
    descriptionPlaceholder: '簡単な説明（オプション）',
    pasteOrUpload: 'テキストを貼り付けるか、.txtファイルをアップロード',
    uploadFile: '.txtアップロード',
    publish: '公開！',
    copy: 'コピー',
    raw: 'RAW',
    copied: 'コピーしました！',
    published: 'ピンが正常に公開されました！',
    error: 'エラーが発生しました',
    noContent: 'コンテンツを入力してください',
    likes: 'いいね',
    comments: 'コメント',
    addComment: 'コメントを追加',
    username: 'ユーザー名',
    usernamePlaceholder: 'あなたの名前',
    commentPlaceholder: 'コメントを書く...',
    postComment: '送信',
    search: 'ピンを検索...',
    sortNewest: '新しい順',
    sortOldest: '古い順'
  }
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'favorites'>('home');
  const [language, setLanguage] = useState<keyof typeof translations>('en');
  const [pins, setPins] = useState<Pin[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinDescription, setNewPinDescription] = useState('');
  const [newPinContent, setNewPinContent] = useState('');
  const [commentUsername, setCommentUsername] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();

  const t = translations[language];

  useEffect(() => {
    fetchPins();
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, [searchQuery, sortOrder]);

  const fetchPins = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortOrder);
      
      const response = await fetch(`${API_URL}?${params}`);
      const data = await response.json();
      setPins(data);
    } catch (error) {
      toast({ title: t.error, variant: 'destructive' });
    }
  };

  const fetchPinDetails = async (pinId: number) => {
    try {
      const response = await fetch(`${API_URL}?id=${pinId}`);
      const data = await response.json();
      setSelectedPin(data);
      setIsDialogOpen(true);
    } catch (error) {
      toast({ title: t.error, variant: 'destructive' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPinContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const publishPin = async () => {
    if (!newPinContent.trim()) {
      toast({ title: t.noContent, variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create', 
          title: newPinTitle,
          description: newPinDescription,
          content: newPinContent 
        })
      });
      
      if (response.ok) {
        toast({ title: t.published });
        setNewPinTitle('');
        setNewPinDescription('');
        setNewPinContent('');
        setActiveTab('home');
        fetchPins();
      }
    } catch (error) {
      toast({ title: t.error, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async (pinId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', pin_id: pinId })
      });
      
      const data = await response.json();
      setPins(pins.map(pin => 
        pin.id === pinId ? { ...pin, likes_count: data.likes_count } : pin
      ));
      
      if (selectedPin && selectedPin.id === pinId) {
        setSelectedPin({ ...selectedPin, likes_count: data.likes_count });
      }
    } catch (error) {
      toast({ title: t.error, variant: 'destructive' });
    }
  };

  const toggleFavorite = (pinId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(pinId)) {
      newFavorites.delete(pinId);
    } else {
      newFavorites.add(pinId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const postComment = async () => {
    if (!selectedPin || !commentContent.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'comment', 
          pin_id: selectedPin.id,
          username: commentUsername || 'Anonymous',
          content: commentContent 
        })
      });
      
      if (response.ok) {
        const newComment = await response.json();
        setSelectedPin({
          ...selectedPin,
          comments: [...(selectedPin.comments || []), newComment]
        });
        setCommentContent('');
      }
    } catch (error) {
      toast({ title: t.error, variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t.copied });
  };

  const openRawView = (pin: Pin) => {
    const rawWindow = window.open('', '_blank');
    if (rawWindow) {
      rawWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; word-wrap: break-word; padding: 0; margin: 0; background: transparent; color: black;">${pin.content}</pre>`);
      rawWindow.document.title = `Pin #${pin.id} - RAW`;
      rawWindow.document.close();
    }
  };

  const filteredPins = activeTab === 'favorites' 
    ? pins.filter(pin => favorites.has(pin.id))
    : pins;

  const PinCard = ({ pin }: { pin: Pin }) => (
    <Card 
      key={pin.id} 
      className="bg-card hover:bg-card/80 transition-colors cursor-pointer"
      onClick={() => fetchPinDetails(pin.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {pin.title && (
              <h3 className="text-lg font-semibold mb-1">{pin.title}</h3>
            )}
            {pin.description && (
              <p className="text-sm text-muted-foreground mb-2">{pin.description}</p>
            )}
            <span className="text-xs text-muted-foreground">
              Pin #{pin.id} • {new Date(pin.created_at).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(pin.id);
              }}
              className="gap-2"
            >
              <Icon 
                name={favorites.has(pin.id) ? "Star" : "Star"} 
                size={18}
                className={favorites.has(pin.id) ? "fill-yellow-400 text-yellow-400" : ""}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(pin.id);
              }}
              className="gap-2 hover:text-primary"
            >
              <Icon name="ThumbsUp" size={18} />
              <span>{pin.likes_count}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="text-sm whitespace-pre-wrap font-mono bg-secondary p-4 rounded-md max-h-32 overflow-y-auto">
          {pin.content.slice(0, 200)}{pin.content.length > 200 ? '...' : ''}
        </pre>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 bg-background z-10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-black via-purple-700 to-blue-600 bg-clip-text text-transparent">
          {t.appName}
        </h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Icon name="Settings" size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{t.settings}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.language}</label>
                <Select value={language} onValueChange={(val) => setLanguage(val as keyof typeof translations)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {activeTab === 'home' || activeTab === 'favorites' ? (
        <div className="px-4 py-4 border-b border-border sticky top-[73px] bg-background z-10">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as 'newest' | 'oldest')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t.sortNewest}</SelectItem>
                <SelectItem value="oldest">{t.sortOldest}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      <main className="flex-1 pb-20 px-4 py-6 overflow-y-auto">
        {(activeTab === 'home' || activeTab === 'favorites') && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mb-4">
              {activeTab === 'favorites' ? t.favoritePins : t.allPins}
            </h2>
            {filteredPins.length === 0 && activeTab === 'favorites' && (
              <p className="text-center text-muted-foreground py-8">{t.noFavorites}</p>
            )}
            {filteredPins.map((pin) => (
              <PinCard key={pin.id} pin={pin} />
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mb-4">{t.createPin}</h2>
            <Card className="bg-card">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.title}</label>
                  <Input
                    type="text"
                    placeholder={t.titlePlaceholder}
                    value={newPinTitle}
                    onChange={(e) => setNewPinTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t.description}</label>
                  <Input
                    type="text"
                    placeholder={t.descriptionPlaceholder}
                    value={newPinDescription}
                    onChange={(e) => setNewPinDescription(e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder={t.pasteOrUpload}
                  value={newPinContent}
                  onChange={(e) => setNewPinContent(e.target.value)}
                  className="min-h-[300px] font-mono"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="gap-2"
                  >
                    <Icon name="Upload" size={18} />
                    {t.uploadFile}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={publishPin}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-black via-purple-700 to-blue-600 hover:opacity-90 transition-opacity"
                  >
                    {t.publish}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedPin && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedPin.title || `Pin #${selectedPin.id}`}
                </DialogTitle>
                {selectedPin.description && (
                  <p className="text-muted-foreground mt-2">{selectedPin.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedPin.created_at).toLocaleString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(selectedPin.id)}
                    className="gap-2"
                  >
                    <Icon 
                      name="Star" 
                      size={18}
                      className={favorites.has(selectedPin.id) ? "fill-yellow-400 text-yellow-400" : ""}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(selectedPin.id)}
                    className="gap-2"
                  >
                    <Icon name="ThumbsUp" size={18} />
                    <span>{selectedPin.likes_count}</span>
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="mt-4">
                <pre className="text-sm whitespace-pre-wrap font-mono bg-secondary p-4 rounded-md mb-4 max-h-96 overflow-y-auto">
                  {selectedPin.content}
                </pre>
                <div className="flex gap-2 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selectedPin.content)}
                    className="gap-2"
                  >
                    <Icon name="Copy" size={16} />
                    {t.copy}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openRawView(selectedPin)}
                    className="gap-2"
                  >
                    <Icon name="FileText" size={16} />
                    {t.raw}
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">{t.comments}</h3>
                  
                  <div className="space-y-4 mb-6">
                    {selectedPin.comments?.map((comment) => (
                      <div key={comment.id} className="bg-secondary p-3 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{comment.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">{t.addComment}</h4>
                    <Input
                      type="text"
                      placeholder={t.usernamePlaceholder}
                      value={commentUsername}
                      onChange={(e) => setCommentUsername(e.target.value)}
                    />
                    <Textarea
                      placeholder={t.commentPlaceholder}
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button
                      onClick={postComment}
                      disabled={!commentContent.trim()}
                      className="w-full"
                    >
                      {t.postComment}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex justify-around py-3">
          <Button
            variant={activeTab === 'home' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('home')}
            className="flex-col gap-1 h-auto py-2"
          >
            <Icon name="Home" size={24} />
            <span className="text-xs">{t.home}</span>
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('create')}
            className="flex-col gap-1 h-auto py-2"
          >
            <Icon name="Plus" size={24} />
            <span className="text-xs">{t.create}</span>
          </Button>
          <Button
            variant={activeTab === 'favorites' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('favorites')}
            className="flex-col gap-1 h-auto py-2"
          >
            <Icon name="Star" size={24} />
            <span className="text-xs">{t.favorites}</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
