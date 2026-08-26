import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function BlogArticleTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, handleToggleComments, handleLikeComment, handlePostComment, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, setShowFoodSearch, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, loadRecipeReviews
  } = tabProps;

  return (
    <>

          <div className="animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => setSelectedArticle(null)} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors font-bold text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-xl w-fit shadow-sm hover:shadow-md">
              <ChevronLeft size={16} />
              Retour au blog
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* MAIN CONTENT (70%) */}
              <div className="lg:w-[70%] space-y-8">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-10 lg:p-12 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#39FF14] text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{selectedArticle.category || 'Nutrition'}</span>
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> {selectedArticle.readTime || `${Math.max(1, Math.ceil(((selectedArticle.content || selectedArticle.desc || '').split(' ').length) / 200))} min`}</span>
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Eye size={12}/> {selectedArticle.views_count || 0} vues</span>
                  </div>
                  <h1 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase text-zinc-900 dark:text-white tracking-tight leading-tight mb-6`}>{selectedArticle.title}</h1>

                  {selectedArticle.image_url && (
                    <div className="w-full h-[300px] md:h-[450px] rounded-[1.5rem] overflow-hidden my-6 shadow-sm">
                      <img src={selectedArticle.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} alt={selectedArticle.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="prose prose-zinc dark:prose-invert max-w-none font-medium text-zinc-600 dark:text-zinc-300 leading-relaxed">
{(() => {
                        let textToRender = selectedArticle.content || selectedArticle.desc || '';

                        // 1. Clean Redundant Title
                        textToRender = textToRender.replace(/^Titre\s*:.*(\r?\n|$)/im, '');

                        // 2. Extract AI Note
                        let aiNote = null;
                        const aiNoteMatch = textToRender.match(/\[([^\]]+IA[^\]]+)\]/i) || textToRender.match(/\[(Généré[^\]]+)\]/i);
                        if (aiNoteMatch) {
                           aiNote = aiNoteMatch[0];
                           textToRender = textToRender.replace(aiNote, '');
                        }

                        // 3. Split into paragraphs
                        const paragraphs = textToRender.split(/\n+/).filter((p: string) => p.trim() !== '');

                        return (
                           <div className="flex flex-col">
                              {paragraphs.map((paragraph: string, index: number) => (
                                 <p key={index} className="mb-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base md:text-lg font-normal" dangerouslySetInnerHTML={{ __html: paragraph }} />
                              ))}

                              {aiNote && (
                                 <div className="mt-8 text-xs text-zinc-400 italic bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    {aiNote}
                                 </div>
                              )}
                           </div>
                        );
                     })()}
                  </div>
                </div>

                {/* SIMILAR ARTICLES */}
                <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                   <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 text-black dark:text-white`}>Articles <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-emerald-400">Similaires</span></h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {articles.filter(a => a.id !== selectedArticle.id && (a.category === selectedArticle.category || !a.category)).slice(0, 3).map((article: any) => (
                         <div key={article.id} onClick={() => handleArticleClick(article)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-[#39FF14] transition-all cursor-pointer flex flex-col h-full group">
                            {article.image_url && (
                               <div className="overflow-hidden rounded-[2rem] mb-4">
                                  <img src={article.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} alt={article.title} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500" />
                               </div>
                            )}
                            <div className="flex gap-2 mb-3">
                               <span className="bg-black text-[#39FF14] px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{article.category || 'Nutrition'}</span>
                               <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1"><Eye size={10}/> {article.views_count || 0}</span>
                            </div>
                            <h4 className={`${spaceGrotesk.className} text-sm font-black uppercase mb-2 leading-tight text-black dark:text-white group-hover:text-[#39FF14] transition-colors line-clamp-2`}>{article.title}</h4>
                         </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* SIDEBAR (30%) */}
              <div className="lg:w-[30%] space-y-6">
                {/* AUTHOR CARD */}
                <div className="bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-5 blur-[50px] rounded-full pointer-events-none"></div>
                   <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Coach Rokhy" className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-800 shadow-xl object-cover bg-black mb-4 z-10" />
                   <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase text-black dark:text-white z-10`}>Coach Rokhy</h3>
                   <span className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest bg-black px-3 py-1 rounded-full mb-4 shadow-md z-10">Experte Nutrition</span>
                   <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed z-10">Créatrice de la méthode "Nutrition à l'Africaine". Je vous aide à perdre du poids sans régime restrictif en rééquilibrant vos plats locaux favoris.</p>
                </div>

                {/* TOP TRENDING */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm">
                   <h3 className={`${spaceGrotesk.className} flex items-center gap-2 text-lg font-black uppercase mb-4 text-black dark:text-white`}><TrendingUp className="text-[#39FF14]" size={18}/> Top Trending</h3>
                   <div className="space-y-4">
                      {[...articles].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 3).map((article: any, idx: number) => (
                         <div key={article.id} onClick={() => handleArticleClick(article)} className="flex items-start gap-4 cursor-pointer group pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 last:pb-0">
                            <span className="text-3xl font-black text-zinc-200 dark:text-zinc-800 group-hover:text-[#39FF14] transition-colors">0{idx + 1}</span>
                            <div>
                               <h4 className="text-xs font-bold text-black dark:text-white group-hover:text-[#39FF14] transition-colors line-clamp-2 leading-tight mb-1">{article.title}</h4>
                               <p className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><Eye size={10}/> {article.views_count || 0} vues</p>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </div>

    </>
  );
}
