import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { getAILearningContent } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';
import type { UserContent, UserContentIcon } from '../types';

// --- SVG Icons for Learning Topics ---
const AnxietyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.553L16.5 21.75l-.398-1.197a3.375 3.375 0 00-2.456-2.456L12.75 18l1.197-.398a3.375 3.375 0 002.456-2.456L17.25 14.25l.398 1.197a3.375 3.375 0 002.456 2.456L21 18.75l-1.197.398a3.375 3.375 0 00-2.456 2.456z" /></svg>);
const ConfidenceIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>);
const EIQIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>);
const CommunicationIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.483l.227.227.182.182.227.227 2.09 2.09 2.09-2.09.227-.227.182-.182.227-.227L12 14.25l-2.09 2.09-2.09-2.09" /></svg>);
const SadnessIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>);
const GratitudeIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>);
const QuizIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

// --- Icons for User Content ---
const UserArticleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>);
const UserVideoIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6H8.25A2.25 2.25 0 006 8.25v7.5A2.25 2.25 0 008.25 18h7.5A2.25 2.25 0 0018 15.75v-7.5A2.25 2.25 0 0015.75 6z" /></svg>);
const UserCourseIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-1.07-1.07m1.07 1.07l1.07 1.07m0 0l-1.07 1.07m-1.07-1.07l-1.07-1.07" /></svg>);
const UserIdeaIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-4.5 0m4.5 0a15.015 15.015 0 01-4.5 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const UserHeartIcon = (props: React.SVGProps<SVGSVGElement>) => GratitudeIcon; // Reuse
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>);

const userContentIcons: Record<UserContentIcon, React.FC<React.SVGProps<SVGSVGElement>>> = {
    article: UserArticleIcon,
    video: UserVideoIcon,
    course: UserCourseIcon,
    idea: UserIdeaIcon,
    heart: UserHeartIcon,
};


interface LearningTopic {
    title: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    promptTopic: string;
}

const learningTopics: LearningTopic[] = [
    { title: "Managing Anxiety", description: "Learn to calm your mind and body when worries arise.", icon: AnxietyIcon, promptTopic: "practical ways to manage daily anxiety" },
    { title: "Building Confidence", description: "Unlock your inner strength and self-worth.", icon: ConfidenceIcon, promptTopic: "how to build self-confidence" },
    { title: "Emotional Intelligence", description: "Understand your emotions to navigate life better.", icon: EIQIcon, promptTopic: "what is emotional intelligence and how to improve it" },
    { title: "Better Communication", description: "Improve your relationships through effective dialogue.", icon: CommunicationIcon, promptTopic: "key skills for better communication in relationships" },
    { title: "Coping with Sadness", description: "Navigate feelings of sadness with compassion.", icon: SadnessIcon, promptTopic: "healthy ways to cope with sadness" },
    { title: "Practicing Gratitude", description: "Discover the powerful effect of thankfulness.", icon: GratitudeIcon, promptTopic: "how to practice gratitude daily" },
];

function simpleMarkdownToHtml(markdown: string): string {
    return markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/# (.*?)(?:\n|$)/g, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
        .replace(/## (.*?)(?:\n|$)/g, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
        .replace(/^\* (.*?)$/gm, '<li class="ml-4">$1</li>')
        .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-2 mb-4">$1</ul>')
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p)
        .map(p => {
            if (p.startsWith('<h1') || p.startsWith('<h2') || p.startsWith('<ul')) {
                return p;
            }
            return `<p class="mb-4 text-gray-600 dark:text-gray-300">${p}</p>`;
        })
        .join('');
}


function getYouTubeEmbedUrl(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

// --- Add Content Modal Component ---
const AddContentModal = ({ isOpen, onClose, onSave }: { isOpen: boolean, onClose: () => void, onSave: (content: UserContent) => void }) => {
    const [contentType, setContentType] = useState<'article' | 'video'>('article');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState<UserContentIcon>('article');
    const [content, setContent] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            return;
        }
        
        let newContent: UserContent;
        if (contentType === 'article') {
            if (!content.trim()) {
                setError('Article content cannot be empty.');
                return;
            }
            newContent = { id: Date.now().toString(), type: 'article', title, description, icon, content };
        } else { // video
            if (!url.trim()) {
                setError('Video URL cannot be empty.');
                return;
            }
             newContent = { id: Date.now().toString(), type: 'video', title, description, icon, url };
        }
        
        onSave(newContent);
        resetAndClose();
    };

    const resetAndClose = () => {
        onClose();
        setTimeout(() => { // delay reset to avoid flash
            setContentType('article');
            setTitle('');
            setDescription('');
            setIcon('article');
            setContent('');
            setUrl('');
            setError('');
        }, 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="Add Your Content">
            <div className="space-y-4">
                 {error && <p className="text-sm text-danger bg-danger/10 p-2 rounded-md">{error}</p>}
                
                {/* Content Type Picker */}
                <div className="flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700">
                    <button onClick={() => setContentType('article')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${contentType === 'article' ? 'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow' : 'text-gray-600 dark:text-gray-400'}`}>Article</button>
                    <button onClick={() => setContentType('video')} className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${contentType === 'video' ? 'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow' : 'text-gray-600 dark:text-gray-400'}`}>Video</button>
                </div>
                
                {/* Common Fields */}
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none" />
                <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-20 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none" />
                
                {/* Icon Picker */}
                <div>
                    <label className="text-sm font-medium text-text-light dark:text-gray-300">Choose an Icon</label>
                    <div className="flex space-x-2 mt-2">
                        {Object.keys(userContentIcons).map(iconKey => {
                            const IconComponent = userContentIcons[iconKey as UserContentIcon];
                            return (
                                <button key={iconKey} onClick={() => setIcon(iconKey as UserContentIcon)} className={`p-2 rounded-full transition-colors ${icon === iconKey ? 'bg-primary/20 dark:bg-primary-dark/30 text-primary dark:text-primary-dark' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300'}`}>
                                    <IconComponent className="h-6 w-6" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Specific Fields */}
                {contentType === 'article' ? (
                    <textarea placeholder="Write your article here... You can use markdown like # Title, ## Subtitle, and * for lists." value={content} onChange={e => setContent(e.target.value)} className="w-full h-40 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none" />
                ) : (
                    <input type="url" placeholder="Enter YouTube or video URL" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark outline-none" />
                )}

                <div className="flex justify-end space-x-2">
                    <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Content</Button>
                </div>
            </div>
        </Modal>
    )
};


const LearningHub: React.FC = () => {
    const [selectedItem, setSelectedItem] = useState<LearningTopic | UserContent | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [userContent, setUserContent] = useLocalStorage<UserContent[]>('userLearningContent', []);

    useEffect(() => {
        if (selectedItem && 'promptTopic' in selectedItem) { // It's a LearningTopic
            const fetchContent = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const articleContent = await getAILearningContent(selectedItem.promptTopic);
                    setContent(simpleMarkdownToHtml(articleContent));
                } catch (err) {
                    setError("Failed to load content. Please try again.");
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchContent();
        } else if (selectedItem) { // It's UserContent
             if(selectedItem.type === 'article') {
                setContent(simpleMarkdownToHtml(selectedItem.content));
             }
        }
    }, [selectedItem]);

    const handleCardClick = (item: LearningTopic | UserContent) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
        setTimeout(() => {
            setSelectedItem(null);
            setContent('');
            setError(null);
        }, 300);
    };
    
    const handleSaveNewContent = (newContent: UserContent) => {
        setUserContent(prev => [...prev, newContent]);
    };

    const handleDeleteContent = (e: React.MouseEvent, idToDelete: string) => {
        e.stopPropagation(); // Prevent modal from opening
        if(window.confirm("Are you sure you want to delete this content?")) {
            setUserContent(prev => prev.filter(item => item.id !== idToDelete));
        }
    };
    
    const allContent = [...learningTopics, ...userContent];

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-4xl font-bold text-text-light dark:text-text-dark">Emotional Learning Hub</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                        Explore bite-sized lessons to grow your emotional skills.
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 sm:mt-0">
                   Add Your Content
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {allContent.map((item) => {
                    const isUserContent = 'type' in item;
                    const Icon = isUserContent ? userContentIcons[item.icon] : item.icon;

                    return (
                        <Card key={isUserContent ? item.id : item.title} className="relative hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col" onClick={() => handleCardClick(item)}>
                           {isUserContent && (
                                <div className="absolute top-2 right-2 flex items-center space-x-1">
                                    <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">Custom</span>
                                    <button onClick={(e) => handleDeleteContent(e, item.id)} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 dark:text-gray-400 hover:text-danger">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                           )}
                           <div className="flex flex-col items-center text-center p-4 flex-grow">
                                <div className="p-4 bg-primary/10 dark:bg-primary-dark/20 rounded-full mb-4">
                                    <Icon className="h-12 w-12 text-primary dark:text-primary-dark" />
                                </div>
                                <h3 className="text-xl font-bold text-text-light dark:text-text-dark">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 flex-grow">{item.description}</p>
                            </div>
                        </Card>
                    );
                })}
                
                <Card className="bg-gray-100 dark:bg-gray-800/50 opacity-70">
                     <div className="flex flex-col items-center text-center p-4">
                        <div className="p-4 bg-gray-300 dark:bg-gray-700 rounded-full mb-4">
                            <QuizIcon className="h-12 w-12 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-text-light dark:text-text-dark">Emotional IQ Tests</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Interactive quizzes to test your knowledge. Coming Soon!</p>
                    </div>
                </Card>
            </div>
            
            <AddContentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveNewContent} />

            <Modal isOpen={isViewModalOpen} onClose={handleCloseViewModal} title={selectedItem?.title || ''}>
                {isLoading && (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                )}
                {error && <p className="text-danger">{error}</p>}
                {!isLoading && !error && selectedItem && (
                    ('type' in selectedItem && selectedItem.type === 'video') ? (
                        getYouTubeEmbedUrl(selectedItem.url) ? (
                            <div className="aspect-w-16 aspect-h-9">
                                <iframe
                                    src={getYouTubeEmbedUrl(selectedItem.url)!}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full aspect-video rounded-lg"
                                ></iframe>
                            </div>
                        ) : (
                             <video controls src={selectedItem.url} className="w-full rounded-lg">Your browser does not support the video tag.</video>
                        )
                    ) : (
                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
                    )
                )}
            </Modal>
        </div>
    );
};

export default LearningHub;
