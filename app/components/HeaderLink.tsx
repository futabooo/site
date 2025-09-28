type Props = HTMLAttributes<"a">;

const { pathname } = Astro.url;
const isActive = href === pathname || href === pathname.replace(/\/$/, "");

export const HeaderLink = ({
  <>
  <a href={href} class:list={[className, { active: isActive }]} {...props}>
  <slot />
</a>
<style>
  a {
    display: inline-block;
    text-decoration: none;
  }
  a.active {
    font-weight: bolder;
    text-decoration: underline;
  }
</style>
</>
})

