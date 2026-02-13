'use client';

import { useState, useEffect } from 'react';
import { Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorialVideo {
    id: number;
    title: string;
    duration: string;
    thumbnail?: string;
    videoUrl?: string;
}

interface TutorialSectionProps {
    accountCreatedAt?: string;
    hideAfterDays?: number;
}

const tutorials: TutorialVideo[] = [
    {
        id: 1,
        title: "How to create your first project",
        duration: "2:30",
        thumbnail: "/images/tutorials/create-project.jpg",
    },
    {
        id: 2,
        title: "How to add funds to your account",
        duration: "1:45",
        thumbnail: "/images/tutorials/add-funds.jpg",
    },
    {
        id: 3,
        title: "How to search for publishers",
        duration: "3:15",
        thumbnail: "/images/tutorials/search-publishers.jpg",
    },
    {
        id: 4,
        title: "How to place your first order",
        duration: "4:00",
        thumbnail: "/images/tutorials/place-order.jpg",
    },
    {
        id: 5,
        title: "Affiliate Program Overview",
        duration: "2:00",
        thumbnail: "/images/tutorials/affiliate.jpg",
    },
];

const storageKey = 'tutorial_section_hidden';

export function TutorialSection({ accountCreatedAt, hideAfterDays = 30 }: TutorialSectionProps) {
    const [visible, setVisible] = useState(false);
    const [activeVideo, setActiveVideo] = useState<TutorialVideo | null>(null);
    const [scrollIndex, setScrollIndex] = useState(0);

    useEffect(() => {
        // Check if hidden by user
        const hidden = localStorage.getItem(storageKey);
        if (hidden === 'true') {
            setVisible(false);
            return;
        }

        // Check account age
        if (accountCreatedAt) {
            const created = new Date(accountCreatedAt);
            const now = new Date();
            const daysSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            setVisible(daysSince <= hideAfterDays);
        } else {
            setVisible(true);
        }
    }, [accountCreatedAt, hideAfterDays]);

    const handleHide = () => {
        localStorage.setItem(storageKey, 'true');
        setVisible(false);
    };

    const scrollLeft = () => {
        setScrollIndex(Math.max(0, scrollIndex - 1));
    };

    const scrollRight = () => {
        setScrollIndex(Math.min(tutorials.length - 3, scrollIndex + 1));
    };

    if (!visible) return null;

    return (
        <div className="bg-white rounded-xl border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Get Started</h2>
                    <p className="text-sm text-gray-500">Watch these tutorials to learn the platform</p>
                </div>
                <button
                    onClick={handleHide}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Hide tutorials"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="relative">
                {/* Scroll buttons */}
                {scrollIndex > 0 && (
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}
                {scrollIndex < tutorials.length - 3 && (
                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* Video cards */}
                <div className="overflow-hidden">
                    <div
                        className="flex gap-4 transition-transform duration-300"
                        style={{ transform: `translateX(-${scrollIndex * 210}px)` }}
                    >
                        {tutorials.map((video) => (
                            <button
                                key={video.id}
                                onClick={() => setActiveVideo(video)}
                                className="flex-shrink-0 w-48 group"
                            >
                                <div className="relative aspect-video bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg overflow-hidden mb-2">
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Play className="w-8 h-8 text-violet-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-5 h-5 text-violet-600 ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                                        {video.duration}
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 text-left line-clamp-2">
                                    {video.title}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Modal Placeholder */}
            {activeVideo && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-3xl w-full mx-4 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">{activeVideo.title}</h3>
                            <button onClick={() => setActiveVideo(null)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="aspect-video bg-gray-900 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <Play className="w-16 h-16 mx-auto mb-2" />
                                <p>Video player placeholder</p>
                                <p className="text-sm">Duration: {activeVideo.duration}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
