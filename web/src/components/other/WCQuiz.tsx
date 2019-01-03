import React from 'react';
import * as d3 from 'd3';
import { fetchVideoSummary } from '../../helpers/fetch';
import { Component } from '../common/Component';
import { ErrorMessage } from '../common/ErrorMessage';
import { VideoSummary, VideoKind } from '../../models/video';
import { Loading } from '../common/Loading';
import { Image } from '../common/Image';
import { CommonSection } from '../common/CommonSection';
import { Share } from 'react-twitter-widgets';
import { getThumbnailLink } from '../../helpers/youtube';

import './WCQuiz.css';

interface WCQuizProps {
}

interface WCQuizState {
    hasError: boolean;
    questions?: Question[];
    confirmed: boolean;
}

interface Question {
    answer: VideoSummary;
    candidates: VideoSummary[];
    select?: number;
}

export class WCQuiz extends Component<WCQuizProps, WCQuizState> {
    constructor(props: WCQuizProps) {
        super(props);

        this.state = {
            hasError: false,
            confirmed: false,
        };

        this.confirm = this.confirm.bind(this);

        this.wrapPromise(fetchVideoSummary())
            .then(summaries => {
                const questions = this.createQuestions(summaries);
                if (questions === null) {
                    this.setState({ ...this.state, hasError: true });
                }
                else {
                    this.setState({ ...this.state, questions: questions });
                }
            })
            .catch(() => {
                this.setState({ ...this.state, hasError: true });
            });
    }

    public render() {
        if (this.state.hasError) {
            return <ErrorMessage/>;
        }

        if (this.state.questions=== undefined) {
            return <Loading/>;
        }

        if (this.state.confirmed) {
            return this.getResult();
        }


        const qs = this.state.questions.map((q, i) => {
            const cs = q.candidates.map((c, j) => {
                const selected = q.select === j;
                const inputId = `question-${i}-${j}`;
                return <div key={c.id}>
                    <input id={inputId} type="radio" checked={selected} onChange={() => this.answer(i, j)}/>
                    <label htmlFor={inputId}>{c.title}</label>
                </div>;
            });
            return <CommonSection key={i} title={`Q${i+1}.`}>
                <Image src={`/asset/video/${q.answer.id}/wc.png`} width={300}/>
                {cs}
            </CommonSection>;
        });

        let answered = 0;
        this.state.questions.forEach(q => {
            if (q.select !== undefined) {
                answered++;
            }
        });

        const okButtonDisabled = answered !== this.state.questions.length;

        return <div>
            {qs}
            <div className="answer-button">
                {`${answered}/${this.state.questions.length}`}
                {<button disabled={okButtonDisabled} onClick={this.confirm}>回答</button>}
            </div>
        </div>;
    }

    getResult() {
        let correct = 0;
        const questions = this.state.questions!;
        questions.forEach(q => {
            if (q.select !== undefined) {
                if (q.answer.id === q.candidates[q.select].id) {
                    correct += 1;
                }
            }
        });

        let w = '';
        if (correct === 10) {
            w = 'かしこい';
        }
        else if (correct >= 5) {
            w = 'えらい'
        }
        else if (correct >= 1) {
            w = 'すごい';
        }
        else {
            w = 'がんばりましょう';
        }


        const shareOptions = {
            text: `ワードクラウドクイズで ${correct}問正解しました`,
            hashtags: '諸説あるWCクイズ',
        };

        const answerdetail = questions.map((q, i) => {
            let userAnswer = '';
            let correct = false;
            if (q.select !== undefined) {
                const v = q.candidates[q.select];
                userAnswer = v.title;
                correct = v.id === q.answer.id;
            }

            return <CommonSection key={i} title={`Q${i+1}. ${correct ? '正解' : '不正解'}`}>
                <Image src={`/asset/video/${q.answer.id}/wc.png`} width={300}/>

                <div>
                    <div>{q.answer.title}</div>
                    <Image src={getThumbnailLink(q.answer.id)} width={300}/>
                </div>
                <div>あなたの回答:</div>
                <div>{userAnswer}</div>
            </CommonSection>;
        });

        return <div>
            <CommonSection title="結果">
                <div>正解数:{correct}</div>
                <div>評価:{w}</div>
                <div>
                    <Share url="https://yamatoiori-kawaii.live/other" options={shareOptions}/>
                </div>
            </CommonSection>
            <CommonSection title="詳細">
                {answerdetail}
            </CommonSection>
        </div>;
    }


    answer(questionIndex: number, answerIndex: number) {
        if (this.state.questions === undefined) return;
        if (questionIndex < 0 || questionIndex >= this.state.questions.length) return;
        const q = this.state.questions[questionIndex];
        if (answerIndex < 0 || answerIndex >= q.candidates.length) return;
        if (q.select === answerIndex) return;

        const newQuestions: Question[] = [];
        this.state.questions.forEach((_q, i) => {
            if (questionIndex !== i) {
                newQuestions.push(_q);
            }
            else {
                newQuestions.push({ ...q, select: answerIndex });
            }
        });


        this.setState({...this.state, questions: newQuestions});
    }

    confirm() {
        window.scrollTo(0, 0);
        this.setState({ ...this.state, confirmed: true });
    }

    createQuestions(summaries: VideoSummary[]): Question[] | null {
        const allValidSummaries = summaries.filter(s => s.existsChatData);
        const q = d3.shuffle(allValidSummaries).slice(0, 10);
        // 10問は必要
        if (q.length < 10) {
            this.setState({ ...this.state, hasError: true });
            return null;
        }

        return q.map((s, i) => {
            let candidates = [s];
            const rand = d3.shuffle(allValidSummaries).slice(0, 4);
            rand.forEach(c => {
                if (candidates.length < 4 && s.id !== c.id) {
                    candidates.push(c);
                }
            });

            return {
                answer: s,
                candidates: d3.shuffle(candidates),
            };
        });
    }
}