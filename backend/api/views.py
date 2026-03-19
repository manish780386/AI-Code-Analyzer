from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
import google.generativeai as genai
import traceback

@api_view(['POST'])
def review_code(request):
    try:
        code = request.data.get("code")
        language = request.data.get("language", "python")

        if not code or code.strip() == "":
            return Response({"error": "Code is required"}, status=400)

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return Response({"error": "GEMINI_API_KEY not found in .env"}, status=500)

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")

        prompt = f"""You are a senior software engineer with 10+ years of experience.
Carefully review the following {language} code and respond EXACTLY in this format:

🐞 Bugs Found:
- (list each bug on a new line starting with -)

⚡ Optimization:
- (list each optimization tip on a new line starting with -)

🔒 Security Issues:
- (list each security issue on a new line starting with -)

💡 Best Practices:
- (list each best practice tip on a new line starting with -)

📊 Code Quality Score: X/10

✅ Improved Code:
```{language}
(write the complete improved version of the code here)
```

📝 Summary:
(write a 2-3 sentence overall summary of the code quality)

Important rules:
- If there are no bugs, write "- No bugs found ✅" under Bugs
- If there are no security issues, write "- No security issues found ✅"
- Be specific and actionable in your feedback
- The improved code must be complete and runnable

Code to review:
```{language}
{code}
```"""

        response = model.generate_content(prompt)

        return Response({
            "review": response.text
        })

    except Exception as e:
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)