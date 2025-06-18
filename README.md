# learn-language

숭실대학교 소프트웨어학부 2025년 1학기 소프트웨어프로젝트 수업 결과물입니다.

- Presentation: [Midterm](assets/midterm_presentation.pdf) | [Final](assets/final_presentation.pdf)
- Proceeding: Porter stemming algorithm 기반의 어휘 학습 프레임워크에 대한 연구 (한국정보처리학회 ASK 2025, KIPS_C2025A0079)

## What is it for?
- **Foreign Language Content Analysis**: Extracts words and provides their translations from:
  - Text
  - YouTube videos with subtitles
- **Flashcard Quiz Mode**: Offers a flashcard quiz mode to facilitate easy learning of each word.
- **Integrated YouTube Learning Environment**: Specifically for YouTube videos with subtitles, it provides an environment where users can simultaneously view the video, original text, translation, and (upon clicking a word) its definition.
- **LLM Utilization**: Leverages LLM (Deepseek-V3-0324) for translation, word extraction, and stemming.
- **Social and Statistical Features**: Includes basic statistical functions and a friends feature.
- Currently, the project is developed exclusively for Korean speakers learning English content, but it is designed with potential for future expansion.


## How to start develop?

### Prepare databases

1. Install [Docker](https://docs.docker.com/engine/install)

1. Run instances using docker compose:

    ```bash
    docker compose up -d
    ```

### Run to dev

1. Install [Bun](https://bun.sh/docs/installation)

1. To install dependencies:

    ```bash
    bun install
    ```

1. To run:

    ```bash
    bun dev # run backend and frontend dev server
    # or...
    bun dev:backend # run backend dev server
    bun dev:frontend # run frontend dev server
    ```

## Contributors
| [김학연](https://github.com/aooen) | [정주현](https://github.com/monkberry71) | [이지현](https://github.com/Ljihyeon) | [김준석](https://github.com/LyleKim) | [하유경](https://github.com/ukyeong-user) |
|:---:|:---:|:---:|:---:|:---:|
| <img width="50px" src="https://avatars.githubusercontent.com/u/33291896?s=60&v=4"> | <img width="50px" src="https://avatars.githubusercontent.com/u/192929224?s=60&v=4"> | <img width="50px" src="https://avatars.githubusercontent.com/u/129281119?s=60&v=4"> | <img width="50px" src="https://avatars.githubusercontent.com/u/88265423?s=60&v=4"> | <img width="50px" src="https://avatars.githubusercontent.com/u/203932021?s=60&v=4"> |
