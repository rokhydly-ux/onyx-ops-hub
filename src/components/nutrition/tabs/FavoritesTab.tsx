import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function FavoritesTab({ ...tabProps }: any) {
  const { today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress } = tabProps;

  return (
    <>

          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full relative min-h-screen pb-24 bg-slate-50 rounded-[3rem]">
            {/* Mesh Gradient Background for Glassmorphism */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[3rem]">
               <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#39FF14] opacity-20 blur-[120px]"></div>
               <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-300 opacity-20 blur-[120px]"></div>
               <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400 opacity-10 blur-[120px]"></div>
            </div>

            <div className="w-full px-6">
                <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6 relative z-10"><ChevronLeft size={16}/> Retour à l&apos;accueil</button>
             </div>

             <div className="w-full relative z-10 px-6">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783288219/17_rf3mmu.png" className="w-12 h-12 object-contain drop-shadow-md" alt="Galerie" /> GALERIE DE RECETTES</h2>

                <div className="relative mb-6">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                   <input
                      type="text"
                      placeholder="Rechercher une recette ou macro (ex: Thieboudienne, 300 kcal, 20g)..."
                      value={favoriteSearchQuery}
                      onChange={e => setFavoriteSearchQuery(e.target.value)}
                      className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition-colors"
                   />
                </div>

                <div className="flex overflow-x-auto custom-scrollbar pb-8 pt-4 gap-4 mb-6">
                   {[
                       { id: 'Tous', desc: 'Le catalogue complet de nos recettes.' },
                       { id: 'Favoris', desc: 'Vos coups de cœur sauvegardés.' },
                       { id: 'Populaire', desc: 'Les plus appréciées par la communauté.' },
                       { id: 'Main Course', desc: 'Plats de résistance copieux.' },
                       { id: 'Healthy', desc: 'Faible en gras, idéal perte de poids.' },
                       { id: 'Low Calories', desc: 'Moins de 350 Kcal par portion.' },
                       { id: 'Desserts', desc: 'Petites douceurs saines.' }
                   ].map(cat => (
                      <div
                         key={cat.id}
                         onClick={() => setRecipeFilter(cat.id)}
                         className={`group perspective cursor-pointer shrink-0 w-32 h-32 rounded-[2rem] relative transition-all duration-500`}
                      >
                         <div className={`absolute inset-0 w-full h-full backface-hidden transition-all duration-500 transform preserve-3d border-2 flex flex-col justify-center items-center text-center p-4 rounded-[2rem] shadow-sm group-hover:[transform:rotateY(180deg)] ${recipeFilter === cat.id ? 'bg-black border-[#39FF14]' : 'bg-white border-white/40 backdrop-blur-md'}`}>
                             <span className={`font-black uppercase tracking-widest text-xs ${recipeFilter === cat.id ? 'text-[#39FF14]' : 'text-black'}`}>{cat.id}</span>
                         </div>
                         <div className={`absolute inset-0 w-full h-full backface-hidden transition-all duration-500 transform preserve-3d border-2 flex flex-col justify-center items-center text-center p-4 rounded-[2rem] shadow-sm [transform:rotateY(180deg)] group-hover:[transform:rotateY(0deg)] bg-[#39FF14] border-[#39FF14]`}>
                             <span className="font-bold text-black text-[10px] leading-tight">{cat.desc}</span>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="w-full">
                   {(() => {
                      const top10RecipeIds = [...allRecipesDB].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10).map(r => r.id);
                      let filteredRecipes = allRecipesDB.filter(r => {
                         if (r.is_boutique === true || r.is_product === true) return false;
                         if (!r.instructions && !r.ingredients) return false;
                         const query = favoriteSearchQuery.toLowerCase();
                         const numericQuery = query.replace(/\D/g, '');
                         const matchSearch = r.nom?.toLowerCase().includes(query) ||
                                             (numericQuery !== "" && r.calories?.toString().includes(numericQuery)) ||
                                             (numericQuery !== "" && r.proteins?.toString().includes(numericQuery));
                         if (!matchSearch) return false;
                         if (recipeFilter === 'Favoris') return favoriteMeals.some(f => (f.meal || f.nom) === r.nom);
                         if (recipeFilter === 'Populaire') return true;
                         if (recipeFilter === 'Main Course') return r.type === 'Déjeuner' || r.type === 'Dîner';
                         if (recipeFilter === 'Healthy') return r.carbs <= 40 && r.fats <= 15;
                         if (recipeFilter === 'Low Calories') return r.calories <= 350;
                         if (recipeFilter === 'Desserts') return r.type === 'Collation' || r.type === 'Petit-déjeuner';
                         return true;
                      });

                      // Sort remaining by popularity if selected
                      if (recipeFilter === 'Populaire') {
                         filteredRecipes = filteredRecipes.sort((a, b) => (b.views || 0) - (a.views || 0));
                      }

                      // Extract Featured Recipe (Randomly selected from filtered list)
                      const featuredRecipe = filteredRecipes.length > 0 ?
                           filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)]
                           : null;

                      const gridRecipes = filteredRecipes.filter(r => r.id !== featuredRecipe?.id);

                      // Reusable Card Renderer
                      const renderCard = (fav, isFeatured = false) => {
                         const name = fav.nom;
                         const cals = fav.calories;
                         const prots = fav.proteins;
                         const isFav = favoriteMeals.some(f => (f.meal || f.nom) === name);
                         const isTop10 = top10RecipeIds.includes(fav.id);

                         const tags = [];
                         if (prots >= 20) tags.push("Protéiné");
                         if (fav.carbs <= 30) tags.push("Low Carb");
                         if (cals <= 350) tags.push("Léger");
                         if (fav.fats <= 15) tags.push("Low Fat");

                         return (
                         <div key={fav.id} onClick={() => { setSelectedRecipeDetail(fav); setRecipeDetailTab('apercu'); }} className={`flex flex-col cursor-pointer bg-white/60 backdrop-blur-lg border border-white/50 p-5 rounded-3xl justify-between hover:border-[#39FF14]/50 hover:bg-white/80 transition-all duration-300 group shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${isFeatured ? 'h-full' : ''}`}>
                             <div className="w-full h-full flex flex-col">
                                 {fav.image_url && <img src={fav.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} alt={name} className={`w-full object-cover rounded-2xl mb-4 ${isFeatured ? 'h-64 sm:h-80 lg:h-96' : 'h-32'}`} />}
                                 <div className="flex justify-between items-start mb-2">
                                     <div className="flex flex-col">
                                         {isFeatured && <span className="text-[#39FF14] bg-black/90 px-2 py-1 rounded-lg w-max text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1 shadow-sm"><Sparkles size={10}/> Recette à la Une</span>}
                                         <p className={`font-black text-black ${isFeatured ? 'text-2xl' : 'text-sm line-clamp-1'}`} title={name}>{name}</p>
                                         <div className="flex gap-3 mt-1.5">
                                             <p className="text-[10px] font-bold text-zinc-600 flex items-center gap-1"><Eye size={12}/> {fav.views || 0}</p>
                                             <p className={`text-[10px] font-bold flex items-center gap-1 ${(fav.preparation_time || 15) > 45 ? 'text-red-500' : 'text-zinc-600'}`}><Clock size={12}/> {fav.preparation_time || 15} min</p>
                                         </div>
                                     </div>
                                     <button onClick={(e) => { e.stopPropagation(); toggleFavorite(fav); }} className={`transition-colors ${isFav ? 'text-red-500 hover:text-red-700' : 'text-zinc-500 hover:text-red-500'} shrink-0 bg-white/80 p-2 rounded-full backdrop-blur-sm shadow-sm`}>
                                        <HeartPulse size={16} className={isFav ? "fill-current" : ""}/>
                                     </button>
                                 </div>
                                 <div className="flex flex-wrap gap-1.5 mb-4 mt-auto pt-2">
                                     {isTop10 && <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm"><Trophy size={10}/> Top 10</span>}
                                     {tags.map(t => <span key={t} className="bg-white text-black border border-zinc-200 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">{t}</span>)}
                                 </div>
                                 <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase text-zinc-700 mb-2">
                                     <span className="flex items-center gap-1"><img src={CALS_ICON} className="w-3.5 h-3.5 rounded-full shadow-sm"/> {cals} kcal</span>
                                     <span className="flex items-center gap-1"><img src={PROTEINS_ICON} className="w-3.5 h-3.5 rounded-full shadow-sm"/> {prots}g prot</span>
                                 </div>
                             </div>
                         </div>
                         )
                      };

                      return (
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                            {/* Left: Featured Recipe (Cols 1-4) */}
                            {featuredRecipe && (
                               <div className="col-span-1 lg:col-span-4 h-full">
                                  {renderCard(featuredRecipe, true)}
                               </div>
                            )}

                            {/* Center: Grid of smaller recipes (Cols 5-9) */}
                            <div className="col-span-1 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {gridRecipes.map(r => renderCard(r, false))}
                            </div>

                            {/* Right: Static Widgets (Cols 10-12) */}
                            <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
                               <div className="bg-white/60 backdrop-blur-lg border border-white/50 shadow-sm rounded-3xl p-5">
                                   <h3 className="font-black text-black uppercase flex items-center gap-2 mb-4"><Flame size={16} className="text-orange-500"/> Trending Topics</h3>
                                   <div className="flex flex-col gap-2">
                                       <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl flex items-center gap-2"><Flame size={14}/> Weight Loss Smoothies</span>
                                       <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-2 rounded-xl flex items-center gap-2"><Dumbbell size={14}/> Muscle Building Smoothies</span>
                                       <span className="text-xs font-bold text-purple-500 bg-purple-50 px-3 py-2 rounded-xl flex items-center gap-2"><Coffee size={14}/> Meal Replacement Recipes</span>
                                       <span className="text-xs font-bold text-green-500 bg-green-50 px-3 py-2 rounded-xl flex items-center gap-2"><Apple size={14}/> Low Carb Smoothies</span>
                                   </div>
                               </div>
                               <div className="bg-white/60 backdrop-blur-lg border border-white/50 shadow-sm rounded-3xl p-5">
                                   <h3 className="font-black text-black uppercase flex items-center gap-2 mb-4"><Heart size={16} className="text-green-500"/> Expert Tips</h3>
                                   <div className="flex flex-col gap-3">
                                       <div className="flex items-start gap-3">
                                           <div className="bg-green-100 p-2 rounded-full shrink-0 mt-0.5"><Leaf size={14} className="text-green-600"/></div>
                                           <div>
                                               <p className="text-xs font-black text-black">Protein + Fiber = Fullness</p>
                                               <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Stay satisfied and avoid unhealthy snacking.</p>
                                           </div>
                                       </div>
                                       <div className="flex items-start gap-3">
                                           <div className="bg-orange-100 p-2 rounded-full shrink-0 mt-0.5"><Droplet size={14} className="text-orange-600"/></div>
                                           <div>
                                               <p className="text-xs font-black text-black">Healthy Fats</p>
                                               <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Add avocado, nuts, seeds or nut butter.</p>
                                           </div>
                                       </div>
                                   </div>
                               </div>
                            </div>
                         </div>
                      );
                   })()}
                   {allRecipesDB.length === 0 && (
                      <div className="col-span-full py-8 text-center text-zinc-500 font-black">Aucune recette disponible.</div>
                   )}
                </div>
             </div>
          </div>

    </>
  );
}
