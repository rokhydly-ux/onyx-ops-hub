import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function ShopTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, handleToggleComments, handleLikeComment, handlePostComment, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, setShowFoodSearch, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, loadRecipeReviews
  } = tabProps;

  return (
    <>

           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l&apos;accueil</button>
              {/* BANNIÈRE HORIZONTALE DYNAMIQUE */}
              <div className="flex items-center gap-4 mb-8">
                 <img src={MENU_ICONS.shop} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Boutique" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} />
                 <div className="flex-1">
                    <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter text-black dark:text-white`}>Boutique Lek Gu Set</h2>
                    <p className="text-zinc-500 font-bold text-sm mt-1">L'épicerie saine de vos objectifs</p>
                 </div>
                 <button onClick={() => { handleTabChange('orders'); document.documentElement.scrollTop = 0; }} className="bg-zinc-800 hover:bg-black text-[#39FF14] border border-[#39FF14]/50 px-6 py-3 ml-4 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2 shrink-0">
                     <Package size={14}/> Suivi des commandes
                 </button>
              </div>

              <div className="w-full h-48 md:h-64 rounded-[2.5rem] overflow-hidden mb-12 shadow-xl relative border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                 <img src={shopBannerUrl} alt="Bannière Boutique" className="absolute inset-0 w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-10">
                     <h2 className={`${spaceGrotesk.className} text-white text-3xl md:text-5xl font-black uppercase tracking-tighter shadow-sm mb-2`}>Essentiels <span className="text-[#39FF14]">Nutrition</span></h2>
                     <p className="text-zinc-300 font-bold uppercase tracking-widest text-[10px] md:text-xs">Atteignez vos objectifs plus vite.</p>
                 </div>
                 {shopCart.length > 0 && (
                     <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end gap-3 z-10 bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                        <button onClick={() => handleTabChange('cart')} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-[0_0_40px_#39FF14] flex items-center gap-3">
                           <ShoppingCart size={20}/> Voir mon Panier ({shopCart.length})
                        </button>
                     </div>
                 )}
              </div>

              {/* TICKET À GRATTER (SCRATCH CARD) */}
              <div className={`flex flex-col md:flex-row items-center justify-between gap-6 p-8 rounded-[2.5rem] mb-12 shadow-sm border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                 <div>
                    <h3 className="text-2xl font-black uppercase text-black dark:text-white mb-2 flex items-center gap-2"><Sparkles className="text-yellow-500"/> Ticket Surprise</h3>
                    <p className="text-sm font-medium text-zinc-500 max-w-sm mb-4">Grattez la zone grise ci-contre (survolez ou touchez) pour révéler votre code promo exclusif du jour.</p>
                 </div>
                 <div className="shrink-0 relative w-64 h-32 rounded-2xl overflow-hidden shadow-inner border-4 border-[#39FF14] bg-black select-none touch-none">
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-0 p-4">
                       <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Code Promo</p>
                       <p className="text-3xl font-black text-[#39FF14] tracking-widest">CODE10</p>
                       <p className="text-[9px] text-zinc-500 uppercase mt-1">-10% de réduction immédiate</p>
                    </div>
                    <div className={`absolute inset-0 grid grid-cols-8 grid-rows-4 z-10 transition-opacity duration-1000 ${scratchedBlocks.length > 16 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {Array.from({ length: 32 }).map((_, i) => (
                           <div
                              key={i}
                              onMouseEnter={() => {
                                 if (!scratchedBlocks.includes(i)) {
                                    setScratchedBlocks(prev => {
                                       const next = [...prev, i];
                                       if (next.length === 17) {
                                          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
                                          audio.volume = 0.6;
                                          audio.play().catch(()=>{});
                                       }
                                       return next;
                                    });
                                 }
                              }}
                              onTouchStart={() => {
                                 if (!scratchedBlocks.includes(i)) {
                                    setScratchedBlocks(prev => {
                                       const next = [...prev, i];
                                       if (next.length === 17) {
                                          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");
                                          audio.volume = 0.6;
                                          audio.play().catch(()=>{});
                                       }
                                       return next;
                                    });
                                 }
                              }}
                              className={`bg-zinc-300 dark:bg-zinc-600 transition-opacity duration-300 border-[0.5px] border-zinc-400 dark:border-zinc-500 ${scratchedBlocks.includes(i) ? 'opacity-0' : 'opacity-100'}`}
                              style={{ cursor: "crosshair" }}
                           ></div>
                        ))}
                    </div>
                    {scratchedBlocks.length <= 16 && (
                        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center opacity-90">
                           <p className="font-black text-white uppercase text-lg rotate-[-10deg] drop-shadow-lg bg-black/40 px-3 py-1 rounded-xl border border-white/20 backdrop-blur-sm">Grattez-moi !</p>
                        </div>
                    )}
                 </div>
              </div>

              {/* CAROUSEL NOUVEAUTÉS */}
              <div className="mb-16">
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2 text-black dark:text-white`}><Sparkles className="text-[#39FF14]"/> Nouveautés de la semaine</h3>
                 <div className="overflow-hidden" ref={emblaNewArrivalsRef}>
                    <div className="flex gap-4">
                       {(Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || []).sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 6).map(product => (
                          <div key={product.id} onClick={() => openProductModal(product)} className={`flex-[0_0_auto] w-64 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border rounded-[2rem] p-4 cursor-pointer hover:border-[#39FF14] transition-all group shadow-sm mr-4`}>
                           <div className="aspect-square rounded-2xl bg-zinc-50 dark:bg-zinc-950 overflow-hidden mb-4 relative">
                              <img src={product.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} alt={product.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <span className="absolute top-2 right-2 bg-black text-[#39FF14] px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-lg">New</span>
                                 {product.stock <= 10 && <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">Quantité Limitée</span>}
                           </div>
                           <h4 className="font-black text-sm uppercase text-black dark:text-white line-clamp-1">{product.nom}</h4>
                           <div className="flex items-center justify-between mt-2">
                               <p className="text-[#39FF14] font-black text-lg">{product.prix_premium.toLocaleString()} F</p>
                               <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="bg-black text-[#39FF14] p-2 rounded-xl hover:bg-[#39FF14] hover:text-black transition-colors shadow-sm" title="Ajouter au panier">
                                   <Plus size={16} />
                               </button>
                           </div>
                       </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* FILTRES & RECHERCHE */}
              <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
                 <div className="relative flex-1 w-full">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                     <input type="text" placeholder="Rechercher un produit..." value={shopSearchQuery} onChange={e=>setShopSearchQuery(e.target.value)} className={`w-full p-4 pl-12 rounded-2xl font-bold text-sm outline-none transition-colors border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#39FF14]' : 'bg-white border-zinc-200 text-black focus:border-black'}`} />
                 </div>
                 <div className={`flex gap-3 items-center p-2 px-4 rounded-2xl border w-full md:w-auto ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                     <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Prix Max:</span>
                     <input type="range" min="0" max="50000" step="1000" value={shopMaxPrice || 50000} onChange={e=>setShopMaxPrice(Number(e.target.value))} className="w-24 md:w-32 accent-[#39FF14] cursor-pointer" />
                     <input type="number" placeholder="Max" value={shopMaxPrice} onChange={e=>setShopMaxPrice(e.target.value?Number(e.target.value):"")} className={`w-20 p-2 rounded-lg text-sm font-bold outline-none text-center ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`} />
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <button onClick={() => setSelectedShopGoal('all')} className={`p-2 rounded-xl border-2 font-black uppercase text-[8px] tracking-widest transition-all ${selectedShopGoal === 'all' ? 'bg-black text-[#39FF14] border-black' : 'bg-white border-zinc-100 text-zinc-400'}`}>Tous</button>
                 {SHOP_GOALS.map(goal => (
                    <button key={goal.id} onClick={() => setSelectedShopGoal(goal.id)} className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-black uppercase text-[8px] tracking-widest transition-all ${selectedShopGoal === goal.id ? 'bg-black text-[#39FF14] border-black shadow-xl' : 'bg-white border-zinc-100 text-zinc-400'}`}>
                       <span className="text-base">{goal.icon}</span> {goal.label}
                    </button>
                 ))}
              </div>

              <div id="shop-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                 {(Array.isArray(shopDataDB) ? shopDataDB : []).flatMap(cat => cat.produits || [])
                    .filter(p => {
                        const matchSearch = !shopSearchQuery || p.nom?.toLowerCase().includes(shopSearchQuery.toLowerCase());
                        const matchMin = shopMinPrice === "" || p.prix_standard >= shopMinPrice;
                        const matchMax = shopMaxPrice === "" || p.prix_standard <= shopMaxPrice;
                        const matchGoal = selectedShopGoal === 'all' || (selectedShopGoal === 'saved' ? savedShopProducts.some((sp: any) => sp.id === p.id) : p.goal === selectedShopGoal);
                        return matchSearch && matchMin && matchMax && matchGoal;
                    })
                    .map((product, index) => (
                       <div key={product.id} className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border rounded-3xl p-4 flex flex-col hover:border-[#39FF14] transition-all hover:shadow-2xl group animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700`} style={{ animationFillMode: 'both', animationDelay: `${index * 100}ms` }}>
                          <div className="relative aspect-square rounded-2xl bg-zinc-50 overflow-hidden mb-4 cursor-pointer" onClick={() => openProductModal(product)}>
                            <img src={product.image_url || 'https://placehold.co/400x400/111/39FF14?text=Produit'} alt={product.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={(e: any) => e.target.src = 'https://placehold.co/400x400/111/39FF14?text=Produit'} />
                             {product.badge && <span className="absolute top-2 right-2 bg-black text-[#39FF14] px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl">{product.badge}</span>}
                             {product.stock <= 10 && <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">Qté Limitée</span>}
                          </div>
                          <h4 className="font-black text-xs sm:text-sm uppercase text-black mb-2 line-clamp-2 leading-tight">{product.nom}</h4>
                          <div className="flex items-center gap-1 mb-3">
                             {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < (product.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-300'} />)}
                             <span className="text-[10px] font-bold text-zinc-500 ml-1">({product.reviews || 0} avis)</span>
                          </div>
                          <div className="flex flex-col gap-1 mb-4 mt-auto">
                             <p className="text-zinc-400 text-sm font-bold line-through">{product.prix_standard.toLocaleString()} F</p>
                             <p className="text-sm sm:text-lg font-black text-[#39FF14] bg-black px-3 py-1 rounded-lg w-max italic">{product.prix_premium.toLocaleString()} F</p>
                          </div>
                          <div className="flex gap-2">
                             {(() => {
                                const cartItem = shopCart.find((item: any) => item.id === product.id);
                                if (cartItem) {
                                    return (
                                        <div className="flex-1 bg-zinc-100 border border-[#39FF14] rounded-xl flex items-center justify-between overflow-hidden shadow-sm h-full">
                                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, cartItem.quantity - 1); }} className="w-10 h-full flex items-center justify-center text-black hover:bg-zinc-200 transition-colors"><Minus size={14}/></button>
                                            <span className="font-black text-sm text-black">{cartItem.quantity}</span>
                                            <button onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, cartItem.quantity + 1); }} className="w-10 h-full flex items-center justify-center bg-[#39FF14] text-black hover:brightness-110 transition-colors"><Plus size={14}/></button>
                                        </div>
                                    );
                                }
                                return (
                                    <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="flex-1 bg-black text-white hover:bg-[#39FF14] hover:text-black py-2.5 rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-sm">
                                        <Plus size={14}/> Ajouter
                                    </button>
                                );
                             })()}
                             <button onClick={(e) => { e.stopPropagation(); toggleSaveProduct(product); }} className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all flex items-center justify-center ${savedShopProducts.some((sp: any) => sp.id === product.id) ? 'border-red-500 bg-red-50 text-red-500' : 'border-zinc-200 bg-white text-zinc-400 hover:border-red-500 hover:text-red-500'}`}>
                                <Heart size={16} className={savedShopProducts.some((sp: any) => sp.id === product.id) ? 'fill-current' : ''} />
                             </button>
                          </div>
                       </div>
                    ))}
              </div>

              <div className="mt-20 pt-12 border-t border-zinc-100">
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3`}><BookOpen className="text-[#39FF14]"/> Nos Conseils Bien-être</h3>
                 <div className="grid md:grid-cols-2 gap-8">
                    {[
                      { title: "Réussir ses pancakes d'avoine ?", desc: "L'astuce pour une texture parfaite sans farine de blé. Idéal avec notre pâte d'arachide pure.", link: "prod_011" },
                      { title: "Pourquoi le Fonio est indispensable ?", desc: "Découvrez pourquoi cette céréale millénaire est le secret d'un ventre plat durable.", link: "prod_001" }
                    ].map((article, idx) => (
                       <div key={idx} className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] flex flex-col">
                          <h4 className="font-black text-lg uppercase mb-3 text-[#39FF14]">{article.title}</h4>
                          <p className="text-sm text-zinc-400 font-medium mb-6 flex-1">{article.desc}</p>
                          <button onClick={() => { setSelectedShopGoal('all'); document.getElementById('shop-grid')?.scrollIntoView({behavior:'smooth'}); }} className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest w-max hover:bg-[#39FF14] transition-colors">Acheter les ingrédients</button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

    </>
  );
}
