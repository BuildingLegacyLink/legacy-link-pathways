import * as React from "react"
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { BookOpen, Trophy, Target, Star, CheckCircle, Play } from 'lucide-react'

export const LearningPreview = () => {
    const navigate = useNavigate();
    
    const handleExploreNow = () => {
        navigate('/learn');
    };

    return (
        <div>
            <main>
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-87.5 absolute right-0 top-0 rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute right-0 top-0 w-56 rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:-5%_-50%]" />
                    <div className="h-[80rem] -translate-y-87.5 absolute right-0 top-0 w-56 rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section className="overflow-hidden bg-gray-50 dark:bg-[#08090a]">
                    <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-24">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl text-gray-900 dark:text-white">
                                Learn Smart, 
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Level Up</span>
                            </h1>
                            <p className="mx-auto my-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
                                Master personal finance through interactive lessons, quizzes, and gamified learning. Build your knowledge while earning XP and unlocking achievements.
                            </p>

                            <Button
                                onClick={handleExploreNow}
                                size="lg"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                                <span className="btn-label">Explore Learning Hub</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mx-auto -mt-16 max-w-7xl [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
                        <div className="[perspective:1200px] [mask-image:linear-gradient(to_left,black_50%,transparent_100%)] -ml-16 pr-16 lg:-ml-56 lg:pr-56">
                            <div className="[transform:rotateX(20deg);]">
                                <div className="lg:h-[44rem] relative -skew-x-[.36rad]">
                                    <div className="rounded-[--radius] z-[2] relative border dark:hidden shadow-2xl shadow-gray-300/20 bg-gray-50 p-8 min-h-[500px]">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-bold text-gray-900">Learning Hub</h2>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Trophy className="h-5 w-5 text-purple-600" />
                                                        <span className="text-lg font-bold text-gray-900">Level 3</span>
                                                    </div>
                                                    <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">1,250 XP</div>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Section */}
                                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                    📈 Your Progress
                                                </h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-600">12</div>
                                                        <div className="text-sm text-gray-600">Lessons Completed</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-pink-600">85%</div>
                                                        <div className="text-sm text-gray-600">Quiz Average</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">8</div>
                                                        <div className="text-sm text-gray-600">Achievements</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Learning Modules */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold flex items-center gap-2">
                                                            <BookOpen className="h-4 w-4 text-blue-600" />
                                                            Budgeting Basics
                                                        </h4>
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                                                    </div>
                                                    <div className="text-xs text-gray-600">5/5 lessons • +300 XP</div>
                                                </div>
                                                
                                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold flex items-center gap-2">
                                                            <Target className="h-4 w-4 text-purple-600" />
                                                            Investment 101
                                                        </h4>
                                                        <Play className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '60%'}}></div>
                                                    </div>
                                                    <div className="text-xs text-gray-600">3/5 lessons • +180/300 XP</div>
                                                </div>
                                            </div>
                                            
                                            {/* Achievements */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                    🏆 Recent Achievements
                                                </h4>
                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 rounded-lg">
                                                        <Star className="h-4 w-4 text-yellow-600" />
                                                        <span className="text-sm font-medium">Budget Master</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 rounded-lg">
                                                        <Trophy className="h-4 w-4 text-purple-600" />
                                                        <span className="text-sm font-medium">Quiz Streak</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium">First Module</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Dark Mode Version */}
                                    <div className="rounded-[--radius] z-[2] relative hidden border dark:block shadow-2xl shadow-black/30 bg-[#08090a] p-8 min-h-[500px]">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-bold text-white">Learning Hub</h2>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Trophy className="h-5 w-5 text-purple-400" />
                                                        <span className="text-lg font-bold text-white">Level 3</span>
                                                    </div>
                                                    <div className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">1,250 XP</div>
                                                </div>
                                            </div>
                                            
                                            {/* Progress Section - Dark */}
                                            <div className="bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-700/50">
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                                    📈 Your Progress
                                                </h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-purple-400">12</div>
                                                        <div className="text-sm text-gray-400">Lessons Completed</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-pink-400">85%</div>
                                                        <div className="text-sm text-gray-400">Quiz Average</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-400">8</div>
                                                        <div className="text-sm text-gray-400">Achievements</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Learning Modules - Dark */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold flex items-center gap-2 text-white">
                                                            <BookOpen className="h-4 w-4 text-blue-400" />
                                                            Budgeting Basics
                                                        </h4>
                                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
                                                    </div>
                                                    <div className="text-xs text-gray-400">5/5 lessons • +300 XP</div>
                                                </div>
                                                
                                                <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-semibold flex items-center gap-2 text-white">
                                                            <Target className="h-4 w-4 text-purple-400" />
                                                            Investment 101
                                                        </h4>
                                                        <Play className="h-5 w-5 text-purple-400" />
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                                        <div className="bg-purple-500 h-2 rounded-full" style={{width: '60%'}}></div>
                                                    </div>
                                                    <div className="text-xs text-gray-400">3/5 lessons • +180/300 XP</div>
                                                </div>
                                            </div>
                                            
                                            {/* Achievements - Dark */}
                                            <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-white">
                                                    🏆 Recent Achievements
                                                </h4>
                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-yellow-900/30 rounded-lg">
                                                        <Star className="h-4 w-4 text-yellow-400" />
                                                        <span className="text-sm font-medium text-gray-300">Budget Master</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-900/30 rounded-lg">
                                                        <Trophy className="h-4 w-4 text-purple-400" />
                                                        <span className="text-sm font-medium text-gray-300">Quiz Streak</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-2 bg-green-900/30 rounded-lg">
                                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                                        <span className="text-sm font-medium text-gray-300">First Module</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default LearningPreview;
