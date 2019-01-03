import React from 'react';
import { CommonBody } from '../common/CommonBody';
import { Route, Switch, Link } from 'react-router-dom';
import { WCQuiz } from './WCQuiz';
import { ErrorMessage } from '../common/ErrorMessage';
import { CommonSection } from '../common/CommonSection';

export class Other extends React.Component {
    constructor(props: {}) {
        super(props);

        this.renderMain = this.renderMain.bind(this);
    }

    public render() {
        return <CommonBody>
            <Switch>
                <Route exact path="/other" render={this.renderMain}/>
                <Route path="/other/wc-quiz" component={WCQuiz}/>
                <Route path="/other" component={ErrorMessage}/>
            </Switch>
        </CommonBody>;
    }

    renderMain() {
        return <div>
            <CommonSection title="ワードクラウドクイズ">
                <p>
                    ランダムで選ばれたワードクラウドを見てその配信のタイトルを当てるクイズです。<br/>
                    4択の選択肢の中から正解だと思う1つを選択してください。<br/>
                    問題数は10問です。<br/>
                </p>
                <div>
                    <Link to='/other/wc-quiz'>ワードクラウドクイズ</Link>
                </div>
            </CommonSection>
        </div>
    }
}