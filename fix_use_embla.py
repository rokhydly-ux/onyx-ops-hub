import re

with open('src/app/nutrition/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I found the issue. `imcValue` on line 707 is fine, but the `useEmblaCarousel` calls are on lines 714 and 715.
# Let's move them up, right under the other state hooks (e.g., around line 680).
# I will just replace them with empty lines, and put them after `const [isOffline, setIsOffline] = useState(false);`

embla_search = """  const [emblaNewArrivalsRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]);
  const [emblaBlogRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]);"""

content = content.replace(embla_search, "")

offline_search = """  const [pushEnabled, setPushEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);"""

offline_replace = """  const [pushEnabled, setPushEnabled] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [emblaNewArrivalsRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]);
  const [emblaBlogRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]);"""

content = content.replace(offline_search, offline_replace)

with open('src/app/nutrition/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
