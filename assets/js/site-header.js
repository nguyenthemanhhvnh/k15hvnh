(function () {
  "use strict";

  const MENU_ITEMS = [
    {
    label:"Trang chủ",
    href:"/"
},
{
    label:"Thư mời",
    children:[
        {
            label:"Thư mời hội khóa",
            href:"/thumoi/"
        },
        {
          label: "Thư mời Thầy Cô",
          href: "/thumoi/thay-co/"
        }
      ]
    },
    {
      label: "Danh sách",
      href: "/danhsach/",
      icon: "☷"
    },
    {
      label: "Nhà tài trợ",
      href: "/nhataitro/",
      icon: "♥"
    },
    {
  label: "Ảnh lớp",
  href: "/gallery/"
}
    {
      label: "Tiện ích",
      icon: "◇",
      children: [
        {
          label: "Tạo ảnh đại diện",
          href: "/avatar/"
        },
        {
          label: "Live Dashboard",
          href: "/dashboard/"
        }
      ]
    }
  ];

  function normalizePath(path) {
    let value = String(path || "/")
      .split("?")[0]
      .split("#")[0];

    if (!value.startsWith("/")) {
      value = "/" + value;
    }

    if (
      value !== "/" &&
      !value.endsWith("/")
    ) {
      value += "/";
    }

    return value;
  }

  function isActive(item, currentPath) {
    if (item.href) {
      const itemPath = normalizePath(item.href);

      if (itemPath === "/") {
        return currentPath === "/";
      }

      return currentPath.startsWith(itemPath);
    }

    if (Array.isArray(item.children)) {
      return item.children.some(function (child) {
        return isActive(child, currentPath);
      });
    }

    return false;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createMenuItem(item, currentPath) {
    const activeClass = isActive(
      item,
      currentPath
    )
      ? " is-active"
      : "";

    if (
      Array.isArray(item.children) &&
      item.children.length
    ) {
      const childrenHtml = item.children
        .map(function (child) {
          const childActive =
            isActive(child, currentPath)
              ? " is-active"
              : "";

          return (
            "<a class='k15-submenu-link" +
            childActive +
            "' href='" +
            escapeHtml(child.href) +
            "'>" +
            escapeHtml(child.label) +
            "</a>"
          );
        })
        .join("");

      return (
        "<div class='k15-menu-group" +
        activeClass +
        "'>" +
          "<button " +
            "class='k15-menu-link k15-dropdown-toggle' " +
            "type='button' " +
            "aria-expanded='false'>" +
              "<span class='k15-menu-icon'>" +
                escapeHtml(item.icon || "") +
              "</span>" +
              "<span>" +
                escapeHtml(item.label) +
              "</span>" +
              "<span class='k15-chevron'>⌄</span>" +
          "</button>" +

          "<div class='k15-submenu'>" +
            childrenHtml +
          "</div>" +
        "</div>"
      );
    }

    return (
      "<a class='k15-menu-link" +
      activeClass +
      "' href='" +
      escapeHtml(item.href) +
      "'>" +
        "<span class='k15-menu-icon'>" +
          escapeHtml(item.icon || "") +
        "</span>" +
        "<span>" +
          escapeHtml(item.label) +
        "</span>" +
      "</a>"
    );
  }

  function renderHeader() {
    const root =
      document.getElementById("k15-site-header");

    if (!root) {
      return;
    }

    const currentPath =
      normalizePath(window.location.pathname);

    const menuHtml = MENU_ITEMS
      .map(function (item) {
        return createMenuItem(
          item,
          currentPath
        );
      })
      .join("");

    root.innerHTML =
      "<header class='k15-header'>" +

        "<div class='k15-header-inner'>" +

          "<a class='k15-brand' href='/'>" +

            "<div class='k15-brand-mark'>" +
              "K15" +
            "</div>" +

            "<div class='k15-brand-copy'>" +
              "<div class='k15-brand-title'>" +
                "K15 FM" +
              "</div>" +

              "<div class='k15-brand-subtitle'>" +
                "Thanh xuân phát lại" +
              "</div>" +
            "</div>" +

          "</a>" +

          "<button " +
            "class='k15-mobile-toggle' " +
            "id='k15MobileToggle' " +
            "type='button' " +
            "aria-label='Mở menu' " +
            "aria-expanded='false'>" +

            "<span></span>" +
            "<span></span>" +
            "<span></span>" +

          "</button>" +

          "<nav " +
            "class='k15-navigation' " +
            "id='k15Navigation'>" +

            menuHtml +

          "</nav>" +

        "</div>" +

      "</header>";

    bindEvents();
  }

  function bindEvents() {
    const mobileToggle =
      document.getElementById(
        "k15MobileToggle"
      );

    const navigation =
      document.getElementById(
        "k15Navigation"
      );

    if (mobileToggle && navigation) {
      mobileToggle.addEventListener(
        "click",
        function () {
          const isOpen =
            navigation.classList.toggle(
              "is-open"
            );

          mobileToggle.classList.toggle(
            "is-open",
            isOpen
          );

          mobileToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
          );
        }
      );
    }

    document
      .querySelectorAll(
        ".k15-dropdown-toggle"
      )
      .forEach(function (button) {
        button.addEventListener(
          "click",
          function (event) {
            event.stopPropagation();

            const parent =
              button.closest(
                ".k15-menu-group"
              );

            const willOpen =
              !parent.classList.contains(
                "is-open"
              );

            document
              .querySelectorAll(
                ".k15-menu-group.is-open"
              )
              .forEach(function (group) {
                if (group !== parent) {
                  group.classList.remove(
                    "is-open"
                  );

                  const toggle =
                    group.querySelector(
                      ".k15-dropdown-toggle"
                    );

                  if (toggle) {
                    toggle.setAttribute(
                      "aria-expanded",
                      "false"
                    );
                  }
                }
              });

            parent.classList.toggle(
              "is-open",
              willOpen
            );

            button.setAttribute(
              "aria-expanded",
              String(willOpen)
            );
          }
        );
      });

    document.addEventListener(
      "click",
      function (event) {
        if (
          !event.target.closest(
            ".k15-menu-group"
          )
        ) {
          document
            .querySelectorAll(
              ".k15-menu-group.is-open"
            )
            .forEach(function (group) {
              group.classList.remove(
                "is-open"
              );
            });
        }
      }
    );

    window.addEventListener(
      "resize",
      function () {
        if (
          window.innerWidth > 860 &&
          navigation
        ) {
          navigation.classList.remove(
            "is-open"
          );

          if (mobileToggle) {
            mobileToggle.classList.remove(
              "is-open"
            );

            mobileToggle.setAttribute(
              "aria-expanded",
              "false"
            );
          }
        }
      }
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      renderHeader
    );
  } else {
    renderHeader();
  }
})();
