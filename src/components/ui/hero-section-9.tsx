import * as React from "react"
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

const menuItems = [
    { name: 'Planning', href: '/planning' },
    { name: 'Learn', href: '/learn' },
    { name: 'Tools', href: '/tools' },
    { name: 'Vault', href: '/vault' },
]

export const HeroSection = () => {
    const navigate = useNavigate();
    const [menuState, setMenuState] = React.useState(false)
    
    const handleGetStarted = () => {
        navigate('/quiz');
    };

    return (
        <div>
            <main>
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-87.5 absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>

                <section className="overflow-hidden bg-white dark:bg-[#08090a]">
                    <div className="relative mx-auto max-w-5xl px-6 py-28 lg:py-24">
                        <div className="relative z-10 mx-auto max-w-2xl text-center">
                            <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl text-gray-900 dark:text-white">
                                Your Financial Future 
                                <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"> Dashboard</span>
                            </h1>
                            <p className="mx-auto my-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
                                See exactly where your money is going and where it could take you. Track your progress toward financial independence with our comprehensive dashboard.
                            </p>

                            <Button
                                onClick={handleGetStarted}
                                size="lg"
                                className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white">
                                <span className="btn-label">Get Started Now</span>
                            </Button>
                        </div>
                    </div>

                    <div className="mx-auto -mt-16 max-w-7xl [mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]">
                        <div className="[perspective:1200px] [mask-image:linear-gradient(to_right,black_50%,transparent_100%)] -mr-16 pl-16 lg:-mr-56 lg:pl-56">
                            <div className="[transform:rotateX(20deg);]">
                                <div className="lg:h-[44rem] relative skew-x-[.36rad]">
                                    <div className="rounded-[--radius] z-[2] relative border dark:hidden shadow-2xl shadow-gray-300/20 bg-gray-50 p-8 min-h-[500px]">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-bold text-gray-900">Financial Planning</h2>
                                                <div className="flex gap-2">
                                                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Dashboard</div>
                                                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Facts</div>
                                                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Plans</div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <div className="text-sm text-gray-600">Net Worth</div>
                                                    <div className="text-2xl font-bold text-gray-900">$75,200</div>
                                                    <div className="text-xs text-green-600">+12% this month</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <div className="text-sm text-gray-600">Cash Flow</div>
                                                    <div className="text-2xl font-bold text-gray-900">+$620</div>
                                                    <div className="text-xs text-green-600">Healthy surplus</div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <div className="text-sm text-gray-600">Financial Score</div>
                                                    <div className="text-2xl font-bold text-gray-900">85</div>
                                                    <div className="text-xs text-blue-600">Good progress</div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                    🎯 My Goals
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Emergency Fund</span>
                                                            <span>$5,000 / $10,000</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '50%'}}></div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>House Down Payment</span>
                                                            <span>$15,000 / $60,000</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-teal-600 h-2 rounded-full" style={{width: '25%'}}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Charts Section - Updated Assets vs Liabilities to Bar Chart */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <h4 className="font-semibold mb-2">Assets vs Liabilities</h4>
                                                    <div className="h-32 relative">
                                                        {/* Bar Chart Mockup */}
                                                        <div className="absolute inset-0 flex items-end justify-center gap-3 pb-6">
                                                            {/* Assets bar */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t" style={{height: '85px'}}></div>
                                                                <span className="text-xs mt-1">Assets</span>
                                                            </div>
                                                            {/* Liabilities bar */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 bg-gradient-to-t from-red-500 to-red-400 rounded-t" style={{height: '25px'}}></div>
                                                                <span className="text-xs mt-1">Liabilities</span>
                                                            </div>
                                                        </div>
                                                        {/* Values */}
                                                        <div className="absolute top-0 left-0 right-0 flex justify-center gap-6 text-xs">
                                                            <span className="text-blue-600">$75K</span>
                                                            <span className="text-red-600">$25K</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <h4 className="font-semibold mb-2">Monthly Cash Flow</h4>
                                                    <div className="h-32 relative">
                                                        <div className="absolute inset-0 flex items-end justify-center gap-2 pb-6">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t" style={{height: '80px'}}></div>
                                                                <span className="text-xs mt-1">Income</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-8 bg-gradient-to-t from-red-500 to-red-400 rounded-t" style={{height: '60px'}}></div>
                                                                <span className="text-xs mt-1">Expenses</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" style={{height: '20px'}}></div>
                                                                <span className="text-xs mt-1">Surplus</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-0 left-0 right-0 flex justify-center gap-4 text-xs">
                                                            <span className="text-green-600">+$4,200</span>
                                                            <span className="text-red-600">-$3,580</span>
                                                            <span className="text-blue-600">+$620</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="rounded-[--radius] z-[2] relative hidden border dark:block shadow-2xl shadow-black/30 bg-[#08090a] p-8 min-h-[500px]">
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-bold text-white">Financial Planning</h2>
                                                <div className="flex gap-2">
                                                    <div className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">Dashboard</div>
                                                    <div className="px-3 py-1 bg-gray-800/50 text-gray-400 rounded-full text-sm">Facts</div>
                                                    <div className="px-3 py-1 bg-gray-800/50 text-gray-400 rounded-full text-sm">Plans</div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                    <div className="text-sm text-gray-400">Net Worth</div>
                                                    <div className="text-2xl font-bold text-white">$75,200</div>
                                                    <div className="text-xs text-green-400">+12% this month</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                    <div className="text-sm text-gray-400">Cash Flow</div>
                                                    <div className="text-2xl font-bold text-white">+$620</div>
                                                    <div className="text-xs text-green-400">Healthy surplus</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                    <div className="text-sm text-gray-400">Financial Score</div>
                                                    <div className="text-2xl font-bold text-white">85</div>
                                                    <div className="text-xs text-blue-400">Good progress</div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-700/50">
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                                                    🎯 My Goals
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-300">Emergency Fund</span>
                                                            <span className="text-gray-300">$5,000 / $10,000</span>
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '50%'}}></div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-300">House Down Payment</span>
                                                            <span className="text-gray-300">$15,000 / $60,000</span>
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                                            <div className="bg-teal-600 h-2 rounded-full" style={{width: '25%'}}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Charts Section - Dark Mode Bar Chart */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                    <h4 className="font-semibold mb-2 text-white">Assets vs Liabilities</h4>
                                                    <div className="h-32 relative">
                                                        {/* Bar Chart Mockup - Dark Mode */}
                                                        <div className="absolute inset-0 flex items-end justify-center gap-3 pb-6">
                                                            {/* Assets bar */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t" style={{height: '85px'}}></div>
                                                                <span className="text-xs mt-1 text-gray-300">Assets</span>
                                                            </div>
                                                            {/* Liabilities bar */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-12 bg-gradient-to-t from-red-600 to-red-500 rounded-t" style={{height: '25px'}}></div>
                                                                <span className="text-xs mt-1 text-gray-300">Liabilities</span>
                                                            </div>
                                                        </div>
                                                        {/* Values */}
                                                        <div className="absolute top-0 left-0 right-0 flex justify-center gap-6 text-xs">
                                                            <span className="text-blue-400">$75K</span>
                                                            <span className="text-red-400">$25K</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg shadow-sm border border-gray-700/50">
                                                    <h4 className="font-semibold mb-2 text-white">Monthly Cash Flow</h4>
                                                    <div className="h-32 relative">
                                                        <div className="absolute inset-0 flex items-end justify-center gap-2 pb-6">
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-8 bg-gradient-to-t from-green-600 to-green-500 rounded-t" style={{height: '80px'}}></div>
                                                                <span className="text-xs mt-1 text-gray-300">Income</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-8 bg-gradient-to-t from-red-600 to-red-500 rounded-t" style={{height: '60px'}}></div>
                                                                <span className="text-xs mt-1 text-gray-300">Expenses</span>
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <div className="w-8 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t" style={{height: '20px'}}></div>
                                                                <span className="text-xs mt-1 text-gray-300">Surplus</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-0 left-0 right-0 flex justify-center gap-4 text-xs">
                                                            <span className="text-green-400">+$4,200</span>
                                                            <span className="text-red-400">-$3,580</span>
                                                            <span className="text-blue-400">+$620</span>
                                                        </div>
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
