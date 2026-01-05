/* 
   EMAILJS CONFIGURATION 
   ---------------------
   You need to create an account at https://www.emailjs.com/
   1. Create a Service (e.g., Gmail) -> Get SERVICE_ID
   2. Create a Template -> Get TEMPLATE_ID
      - Configure template parameters: {{from_name}}, {{from_email}}, {{message}}, {{type}}
   3. Get Public Key from Account -> API Keys -> PUBLIC_KEY
   4. Replace the placeholders below.
*/

// REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
const EMAILJS_SERVICE_ID = "service_ajd7vmw";
const EMAILJS_TEMPLATE_ID = "template_56pjzpj";
const EMAILJS_PUBLIC_KEY = "8iF6w8SilOUYgaMho";

document.addEventListener('DOMContentLoaded', () => {

    // Initialize EmailJS
    emailjs.init(EMAILJS_PUBLIC_KEY);

    // Prevent auto-scroll to contact on refresh
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Clear hash from URL without reloading
    if (window.location.hash) {
        history.replaceState(null, null, ' ');
    }

    // Force scroll to top (immediate + delayed for reliability)
    window.scrollTo(0, 0);
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 10);

    // 1. Dynamic Year in Footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Helper: Send Email via EmailJS
    const sendNotification = (params, statusElement, successMsg) => {
        if (statusElement) {
            statusElement.style.display = 'block';
            statusElement.style.color = 'var(--text-muted)';
            statusElement.textContent = "Sending...";
        }

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                if (statusElement) {
                    statusElement.style.color = '#4cd137'; // Green
                    statusElement.textContent = successMsg || "Sent successfully!";
                    setTimeout(() => {
                        statusElement.style.display = 'none';
                    }, 5000);
                }
            }, function (error) {
                console.log('FAILED...', error);
                if (statusElement) {
                    statusElement.style.color = '#e84118'; // Red
                    statusElement.textContent = "Failed to send. Please check console.";
                }
            });
    };

    // 2. Like Button Logic
    const likeBtn = document.getElementById('like-btn');
    const LOCAL_STORAGE_LIKE_COUNT_KEY = 'portfolio_like_count';
    const LOCAL_STORAGE_USER_LIKED_KEY = 'portfolio_user_liked';

    // Load initial state
    let likeCount = parseInt(localStorage.getItem(LOCAL_STORAGE_LIKE_COUNT_KEY)) || 0;
    let hasLiked = localStorage.getItem(LOCAL_STORAGE_USER_LIKED_KEY) === 'true';
    let isLikeBtnDisabled = false;

    // Remove old span if it exists, repurpose button
    // The user requested NO public count, but "Increase like count instantly" implies internal tracking or maybe just implied logic.
    // However, "public count" was removed in previous steps. 
    // I will implement internal counting as requested by "Increase like count... Store like count".

    // Check if we need to restore the count element or just keep it internal. 
    // "Modify... Like Button... Increase like count instantly... Store like count... Send notification"
    // Previous "Privacy" request said "Hide Public Like Count". 
    // So I will maintain the count in storage but NOT display it, respecting both requests (Store it, don't show it).

    if (hasLiked && likeBtn) {
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = '<i class="fas fa-heart"></i> Liked';
    }

    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            if (isLikeBtnDisabled) return; // Spam prevention

            if (!hasLiked) {
                // User Likes
                likeCount++;
                hasLiked = true;
                localStorage.setItem(LOCAL_STORAGE_LIKE_COUNT_KEY, likeCount);
                localStorage.setItem(LOCAL_STORAGE_USER_LIKED_KEY, 'true');

                // UI Update
                likeBtn.classList.add('liked');
                likeBtn.innerHTML = '<i class="fas fa-heart"></i> Liked';

                // Send Email Notification
                sendNotification({
                    type: "New Like",
                    from_name: "Visitor",
                    from_email: "N/A",
                    message: "A visitor liked your portfolio!"
                }, null); // No status text for like, silent background send

                // Disable button temp
                isLikeBtnDisabled = true;
                setTimeout(() => { isLikeBtnDisabled = false; }, 3000);
            }
            // Optional: User Unlikes (Logic not explicitly requested to remove, but standard toggle)
        });
    }

    // 3. Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            // Prepare EmailJS parameters
            // Make sure your EmailJS template uses these variable names: {{from_name}}, {{from_email}}, {{message}}
            const templateParams = {
                type: "Contact Message",
                from_name: name,
                from_email: email,
                message: message
            };

            sendNotification(templateParams, contactStatus, "Message sent successfully!");
            contactForm.reset();
        });
    }

    // 4. Comment System Logic
    const postCommentBtn = document.getElementById('post-comment-btn');
    const commentNameInput = document.getElementById('comment-name');
    const commentTextInput = document.getElementById('comment-text');
    const commentStatus = document.getElementById('comment-status');
    // Using a container to show comments IF existence
    // If previous steps removed the container, we might need to add it back or just append to body? 
    // Checking index.html... div.comment-section exists. I will append comments there or create a list.
    let commentsList = document.getElementById('comments-list');

    // Create list if missing (since we removed it in previous steps)
    if (!commentsList) {
        const commentSection = document.querySelector('.comment-section');
        if (commentSection) {
            commentsList = document.createElement('div');
            commentsList.id = 'comments-list';
            commentsList.style.marginTop = '20px';
            commentSection.appendChild(commentsList);
        }
    }

    const LOCAL_STORAGE_COMMENTS_KEY = 'portfolio_comments';

    // Load existing comments
    const loadComments = () => {
        const comments = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMMENTS_KEY)) || [];
        if (commentsList) {
            commentsList.innerHTML = '';
            comments.forEach(c => displayComment(c));
        }
    };

    const displayComment = (data) => {
        if (!commentsList) return;
        const div = document.createElement('div');
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.padding = '10px';
        div.style.marginBottom = '10px';
        div.style.borderRadius = '5px';
        div.style.borderLeft = '3px solid var(--primary-color)';

        div.innerHTML = `
            <strong style="color: var(--primary-color)">${escapeHTML(data.name)}</strong>
            <p style="margin-top: 5px; color: var(--text-color)">${escapeHTML(data.text)}</p>
        `;
        commentsList.prepend(div);
    };

    // ESCAPE HTML for security
    const escapeHTML = (str) => {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag]));
    };

    if (postCommentBtn) {
        postCommentBtn.addEventListener('click', () => {
            const name = commentNameInput.value.trim() || 'Anonymous';
            const text = commentTextInput.value.trim();

            if (text === "") {
                alert("Please write a comment!");
                return;
            }

            // 1. Display Instantly
            const newComment = { name, text };
            displayComment(newComment);

            // 2. Store in LocalStorage
            const comments = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMMENTS_KEY)) || [];
            comments.push(newComment);
            localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(comments));

            // 3. Send Email
            const templateParams = {
                type: "New Comment",
                from_name: name,
                from_email: "N/A", // or ask for email in comment form if needed
                message: text
            };

            sendNotification(templateParams, commentStatus, "Comment posted and sent to owner!");

            // Clear inputs
            commentNameInput.value = '';
            commentTextInput.value = '';
        });
    }

    // Load comments on start
    loadComments();

    // 5. Timeline Scroll Highlighting (Preserved)
    const timelineItems = document.querySelectorAll('.timeline-item, .v-timeline-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.5 });
    timelineItems.forEach(item => observer.observe(item));

    // 6. Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });

        // Close menu when a link is clicked
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('toggle');
            });
        });
    }
});
