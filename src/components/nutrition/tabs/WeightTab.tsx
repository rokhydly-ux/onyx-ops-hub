import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function WeightTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress } = tabProps;

  return (
    <>

            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 w-full max-w-7xl mx-auto">
                {/* Header and Background */}
                <div className="relative rounded-[2.5rem] p-6 md:p-8 border border-zinc-200 shadow-sm overflow-hidden min-h-[70vh] flex flex-col justify-between">
                    {/* Background Images */}
                    <div className="absolute inset-0 z-0 hidden md:block">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783280413/Woman_standing_on_scale_smiling_202607051938_e6h39p.jpg" alt="Background" className="w-full h-full object-cover opacity-10" />
                    </div>
                    <div className="absolute inset-0 z-0 block md:hidden">
                        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783280897/weight_gfpje9.jpg" alt="Background" className="w-full h-full object-cover opacity-10" />
                    </div>

                    {/* Gradient Overlay for Readability */}
                    <div className="absolute inset-0 bg-white/70 md:bg-white/50 backdrop-blur-[2px] z-0"></div>

                    <div className="relative z-10 w-full mb-6">
                        <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-4"><ChevronLeft size={16}/> Retour à l&apos;accueil</button>
                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-black">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg" alt="Balance 3D" className="w-8 h-8 rounded-full object-cover mix-blend-multiply" />
                            Mon Poids
                        </h2>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 w-full flex-grow">
                        {/* Top Chart Area */}
                        <div className="col-span-12 lg:col-span-8 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col min-h-[300px]">
                            <h3 className="text-sm font-black text-black mb-4 flex justify-between items-center">
                                Évolution du Poids
                            </h3>
                            <div className="flex-grow w-full min-h-[200px] min-w-[200px] h-[200px] relative">
                                {weightLogs.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={[...weightLogs].reverse()}>
                                            <defs>
                                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.5} />
                                            <XAxis
                                                dataKey="log_date"
                                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}}
                                                dy={10}
                                            />
                                            <YAxis
                                                domain={['dataMin - 2', 'dataMax + 2']}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 'bold'}}
                                                dx={-10}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{borderRadius: '12px', border: 'none', backgroundColor: '#000', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', fontWeight: 'bold', fontSize: '12px', padding: '8px 12px'}}
                                                itemStyle={{color: '#fff', fontWeight: '900'}}
                                                labelStyle={{display: 'none'}}
                                                cursor={{stroke: '#39FF14', strokeWidth: 1, strokeDasharray: '3 3'}}
                                                formatter={(value) => [`${value} kg`, 'Weight Loss']}
                                            />
                                            {clientProfile?.diagnostic_data?.targetWeight && (
                                                <ReferenceLine y={parseFloat(clientProfile.diagnostic_data.targetWeight)} stroke="#39FF14" strokeDasharray="3 3" opacity={0.5} />
                                            )}
                                            <Area
                                                type="monotone"
                                                dataKey="weight"
                                                stroke="#39FF14"
                                                strokeWidth={4}
                                                fillOpacity={1}
                                                fill="url(#colorWeight)"
                                                activeDot={{r: 6, fill: "#000", strokeWidth: 2, stroke: "#39FF14"}}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                                        <p className="text-xs font-bold">Aucun poids enregistré</p>
                                    </div>
                                )}
                            </div>
                        </div>



                        {/* Top Right: Community */}
                        <div className="col-span-12 lg:col-span-4 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col min-h-[300px] justify-between">
                            <h3 className="text-sm font-black text-black mb-4">Podium Communauté</h3>
                            <div className="flex-grow flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                                <div className="flex items-start gap-3 bg-zinc-50/80 p-3 rounded-2xl">
                                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg" alt="Aïssatou K." className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                                    <div className="bg-[#39FF14] text-black text-xs font-bold p-3 rounded-2xl rounded-tl-sm shadow-sm relative flex flex-col gap-1 w-full"><span className="absolute -left-2 top-0 text-[10px] bg-yellow-400 w-4 h-4 rounded-full flex items-center justify-center shadow-sm">1</span><span>Aïssatou K.</span><span className="text-[10px] font-normal opacity-80">Perte totale : -12 kg</span></div>
                                </div>
                                <div className="flex items-start gap-3 bg-zinc-50/80 p-3 rounded-2xl flex-row-reverse">
                                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg" alt="Penda D." className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                                    <div className="bg-[#39FF14] text-black text-xs font-bold p-3 rounded-2xl rounded-tr-sm shadow-sm relative flex flex-col items-end gap-1 w-full"><span className="absolute -right-2 top-0 text-[10px] bg-zinc-300 w-4 h-4 rounded-full flex items-center justify-center shadow-sm">2</span><span>Penda D.</span><span className="text-[10px] font-normal opacity-80">Perte totale : -9 kg</span></div>
                                </div>
                                <div className="flex items-start gap-3 bg-zinc-50/80 p-3 rounded-2xl">
                                    <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg" alt="Amadou T." className="w-10 h-10 rounded-full object-cover shadow-sm border border-white" />
                                    <div className="bg-white border border-zinc-100 text-black text-xs font-bold p-3 rounded-2xl rounded-tl-sm shadow-sm relative flex flex-col gap-1 w-full"><span className="absolute -left-2 top-0 text-[10px] bg-amber-600 text-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm">3</span><span>Amadou T.</span><span className="text-[10px] font-normal opacity-80">Perte totale : -7 kg</span></div>
                                </div>
                            </div>
                            <button onClick={() => handleTabChange('community')} className="w-full mt-4 bg-[#39FF14] hover:bg-[#32e612] text-black font-black uppercase text-xs py-3 rounded-xl transition-colors shadow-sm tracking-widest">Voir la communauté</button>
                        </div>
                        {/* Bottom Left: Current vs Target Weight */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col justify-between relative overflow-hidden cursor-pointer" onClick={() => setShowWeightModal(true)}>
                            <h3 className="text-sm font-black text-black mb-6">Poids Actuel vs Cible</h3>

                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 mb-1">Actuel :</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl sm:text-5xl font-black tracking-tighter">
                                            {weightLogs.length > 0 ? parseFloat(weightLogs[weightLogs.length - 1].weight).toFixed(1) : '--'}
                                        </span>
                                        <span className="text-xl font-black">kg</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => { setNewWeight(weightLogs.length > 0 ? (parseFloat(weightLogs[weightLogs.length - 1].weight) + 0.1).toFixed(1) : ''); setShowWeightModal(true); }} className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center font-black text-xl transition-colors shadow-sm">
                                        +
                                    </button>
                                    <button onClick={() => { setNewWeight(weightLogs.length > 0 ? (parseFloat(weightLogs[weightLogs.length - 1].weight) - 0.1).toFixed(1) : ''); setShowWeightModal(true); }} className="w-10 h-10 rounded-xl bg-green-100/50 hover:bg-green-100 text-red-400 flex items-center justify-center font-black text-xl transition-colors shadow-sm">
                                        -
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-end border-t border-zinc-100 pt-4">
                                <div>
                                    <p className="text-xs font-bold text-zinc-500 mb-1">Cible :</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl sm:text-4xl font-black tracking-tighter">
                                            {clientProfile?.diagnostic_data?.targetWeight || '--'}
                                        </span>
                                        <span className="text-lg font-black">kg</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                     <div className="w-8 h-8 rounded-full bg-[#39FF14]/20 flex items-center justify-center">
                                        <ArrowRight size={16} className="text-green-600"/>
                                     </div>
                                     {weightLogs.length > 0 && parseFloat(weightLogs[weightLogs.length-1].weight) <= parseFloat(clientProfile?.diagnostic_data?.targetWeight || '0') ? (
                                        <span className="text-xl" title="Objectif Atteint">😎</span>
                                     ) : (
                                        <span className="text-xl" title="En cours">🤨</span>
                                     )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Center: BMI/IMC History */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-white flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-black">Historique IMC</h3>
                                <HeartPulse size={20} className="text-red-500" />
                            </div>

                            <div className="space-y-3 flex-grow overflow-y-auto max-h-[220px] custom-scrollbar pr-2">
                                {weightLogs.length > 0 ? (
                                    [...weightLogs].reverse().map((log, idx, arr) => {
                                        const hM = (clientProfile?.diagnostic_data?.height || 170) / 100;
                                        const currentW = parseFloat(log.weight);
                                        const imcVal = hM > 0 ? currentW / (hM * hM) : 0;

                                        const prevLog = arr[idx + 1];
                                        let diff = 0;
                                        if (prevLog) diff = currentW - parseFloat(prevLog.weight);

                                        return (
                                            <div key={log.log_date} className="bg-zinc-100/80 p-3 sm:p-4 rounded-2xl flex justify-between items-center group hover:bg-zinc-200 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">{new Date(log.log_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}:</span>
                                                    <span className="text-sm font-black">{log.weight} kg</span>
                                                    <span className="text-xs font-bold text-zinc-500">- IMC {imcVal.toFixed(1)}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {diff < 0 ? <TrendingDown size={18} className="text-green-500"/> : diff > 0 ? <TrendingUp size={18} className="text-orange-500"/> : <span className="w-[18px]"></span>}
                                                    <button onClick={() => handleDeleteWeight(log.log_date)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex items-center justify-center h-full text-zinc-400 font-bold text-sm">
                                        Pas d&apos;historique
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Recipes */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white flex flex-col h-[280px]">
                            <h3 className="text-sm font-black text-black mb-3 px-2">Recettes</h3>
                            <div className="relative flex-grow rounded-2xl overflow-hidden mb-3">
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783286332/IMG-20250820-WA0117_iegikb.jpg" alt="Recipe of the day" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                    <p className="text-white text-xs font-bold leading-tight">{trackingMode === 'guided' ? "Recette de votre plan" : "Recette minceur recommandée"}</p>
                                </div>
                            </div>
                            <button onClick={() => handleTabChange('favorites')} className="w-full bg-white border border-zinc-200 hover:bg-zinc-50 text-black font-black uppercase text-[10px] py-2.5 rounded-xl transition-colors shadow-sm tracking-widest">Voir Recettes</button>
                        </div>

                        {/* Bottom Fitness */}
                        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-white flex flex-col h-[280px]">
                            <h3 className="text-sm font-black text-black mb-3 px-2">Fitness</h3>
                            <div className="relative flex-grow rounded-2xl overflow-hidden group cursor-pointer" onClick={() => handleTabChange('fitness')}>
                                <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783286277/Woman_wearing_workout_clothes_2K_202607052117_cn1ehb.jpg" alt="Fitness" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-x-3 bottom-3">
                                    <button className="w-full bg-[#39FF14] hover:bg-[#32e612] text-black font-black uppercase text-[10px] py-2.5 rounded-xl transition-colors shadow-md tracking-widest">Démarrer Séance</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Weight Input Modal (Inline or Popup) */}
                {showWeightModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative">
                            <button onClick={() => setShowWeightModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black bg-zinc-100 p-2 rounded-full transition-colors"><X size={16}/></button>
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                    <Scale size={24} className="text-black" />
                                </div>
                                <h3 className="text-xl font-black uppercase text-center">Nouveau Poids</h3>
                                <p className="text-xs font-bold text-zinc-500 mt-1">Quelle est votre pesée du jour ?</p>
                            </div>

                            <div className="flex items-center justify-center gap-4 mb-6">
                                <input
                                    type="number"
                                    step="0.1"
                                    value={newWeight}
                                    onChange={(e) => setNewWeight(e.target.value)}
                                    placeholder="00.0"
                                    className="w-32 text-4xl font-black p-4 border-b-2 border-zinc-200 bg-transparent focus:outline-none focus:border-black text-center text-black transition-colors"
                                    autoFocus
                                />
                                <span className="text-2xl font-black text-zinc-400">KG</span>
                            </div>

                            <button onClick={() => { handleSaveWeight(); setShowWeightModal(false); }} className="w-full py-4 bg-black text-[#39FF14] rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-lg flex justify-center items-center gap-2">
                                <CheckCircle size={20}/> Enregistrer
                            </button>
                        </div>
                    </div>
                )}
            </div>

    </>
  );
}
