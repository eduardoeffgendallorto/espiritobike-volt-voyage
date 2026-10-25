<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep a single Lenis instance in SmoothScroll, driven by the GSAP ticker and synchronized with ScrollTrigger; this avoids competing animation loops across routes.
- Disable smooth scrolling for reduced-motion preferences and use the shared Button for back-to-top navigation; this keeps the navigation accessible.
