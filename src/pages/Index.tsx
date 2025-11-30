import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_URL = 'https://functions.poehali.dev/0faf505c-400d-47c3-b94e-eff3015e9f7a';

interface Pin {
  id: number;
  content: string;
  created_at: string;
  likes_count: number;
}

const translations = {
  en: {
    appName: 'PublicBin',
    home: 'Home',
    create: 'Create',
    settings: 'Settings',
    language: 'Language',
    allPins: 'All Pins',
    createPin: 'Create New Pin',
    pasteOrUpload: 'Paste your text or upload a .txt file',
    uploadFile: 'Upload .txt file',
    publish: 'Publish!',
    copy: 'Copy',
    raw: 'RAW',
    copied: 'Copied to clipboard!',
    published: 'Pin published successfully!',
    error: 'An error occurred',
    noContent: 'Please enter some content',
    likes: 'likes'
  },
  ru: {
    appName: 'PublicBin',
    home: 'Главная',
    create: 'Создать',
    settings: 'Настройки',
    language: 'Язык',
    allPins: 'Все пины',
    createPin: 'Создать новый пин',
    pasteOrUpload: 'Вставьте текст или загрузите .txt файл',
    uploadFile: 'Загрузить .txt',
    publish: 'Опубликовать!',
    copy: 'Копировать',
    raw: 'RAW',
    copied: 'Скопировано!',
    published: 'Пин успешно опубликован!',
    error: 'Произошла ошибка',
    noContent: 'Пожалуйста, введите текст',
    likes: 'лайков'
  },
  ar: {
    appName: 'PublicBin',
    home: 'الرئيسية',
    create: 'إنشاء',
    settings: 'الإعدادات',
    language: 'اللغة',
    allPins: 'جميع الدبابيس',
    createPin: 'إنشاء دبوس جديد',
    pasteOrUpload: 'الصق النص أو قم بتحميل ملف .txt',
    uploadFile: 'تحميل .txt',
    publish: 'نشر!',
    copy: 'نسخ',
    raw: 'RAW',
    copied: 'تم النسخ!',
    published: 'تم نشر الدبوس بنجاح!',
    error: 'حدث خطأ',
    noContent: 'الرجاء إدخال بعض المحتوى',
    likes: 'إعجابات'
  },
  de: {
    appName: 'PublicBin',
    home: 'Startseite',
    create: 'Erstellen',
    settings: 'Einstellungen',
    language: 'Sprache',
    allPins: 'Alle Pins',
    createPin: 'Neuen Pin erstellen',
    pasteOrUpload: 'Text einfügen oder .txt-Datei hochladen',
    uploadFile: '.txt hochladen',
    publish: 'Veröffentlichen!',
    copy: 'Kopieren',
    raw: 'RAW',
    copied: 'In Zwischenablage kopiert!',
    published: 'Pin erfolgreich veröffentlicht!',
    error: 'Ein Fehler ist aufgetreten',
    noContent: 'Bitte geben Sie Inhalt ein',
    likes: 'Likes'
  },
  zh: {
    appName: 'PublicBin',
    home: '首页',
    create: '创建',
    settings: '设置',
    language: '语言',
    allPins: '所有贴子',
    createPin: '创建新贴子',
    pasteOrUpload: '粘贴文本或上传 .txt 文件',
    uploadFile: '上传 .txt',
    publish: '发布！',
    copy: '复制',
    raw: 'RAW',
    copied: '已复制！',
    published: '贴子发布成功！',
    error: '发生错误',
    noContent: '请输入内容',
    likes: '点赞'
  },
  ja: {
    appName: 'PublicBin',
    home: 'ホーム',
    create: '作成',
    settings: '設定',
    language: '言語',
    allPins: 'すべてのピン',
    createPin: '新しいピンを作成',
    pasteOrUpload: 'テキストを貼り付けるか、.txtファイルをアップロード',
    uploadFile: '.txtアップロード',
    publish: '公開！',
    copy: 'コピー',
    raw: 'RAW',
    copied: 'コピーしました！',
    published: 'ピンが正常に公開されました！',
    error: 'エラーが発生しました',
    noContent: 'コンテンツを入力してください',
    likes: 'いいね'
  }
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<'home' | 'create'>('home');
  const [language, setLanguage] = useState<keyof typeof translations>('en');
  const [pins, setPins] = useState<Pin[]>([]);
  const [newPinContent, setNewPinContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const t = translations[language];

  useEffect(() => {
    fetchPins();
  }, []);

  const fetchPins = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPins(data);
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
        body: JSON.stringify({ action: 'create', content: newPinContent })
      });
      
      if (response.ok) {
        toast({ title: t.published });
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
      rawWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap; padding: 20px; background: #1a1f2c; color: white; margin: 0;">${pin.content}</pre>`);
      rawWindow.document.title = `Pin #${pin.id} - RAW`;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
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

      <main className="flex-1 pb-20 px-4 py-6 overflow-y-auto">
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mb-4">{t.allPins}</h2>
            {pins.map((pin) => (
              <Card key={pin.id} className="bg-card hover:bg-card/80 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Pin #{pin.id} • {new Date(pin.created_at).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(pin.id)}
                        className="gap-2 hover:text-primary"
                      >
                        <Icon name="ThumbsUp" size={18} />
                        <span>{pin.likes_count}</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap font-mono bg-secondary p-4 rounded-md mb-4 max-h-48 overflow-y-auto">
                    {pin.content}
                  </pre>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(pin.content)}
                      className="gap-2"
                    >
                      <Icon name="Copy" size={16} />
                      {t.copy}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRawView(pin)}
                      className="gap-2"
                    >
                      <Icon name="FileText" size={16} />
                      {t.raw}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-semibold mb-4">{t.createPin}</h2>
            <Card className="bg-card">
              <CardContent className="pt-6 space-y-4">
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
        </div>
      </nav>
    </div>
  );
}
