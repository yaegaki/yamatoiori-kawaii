import React from "react";
import './About.css'
import { Link } from "react-router-dom";
import { CommonBody } from '../common/CommonBody';

export class About extends React.Component {
    public render() {
        return <CommonBody>
            {this.getAboutDescription()}
            {this.getContentDescription()}
            {this.getNotes()}
        </CommonBody>;
    }

    getAboutDescription() {
        return <section>
            <h2>このサイトについて</h2>
            <p>
                このサイトは.LIVE所属のVTuber、ヤマト&nbsp;イオリさん(<a href="https://www.youtube.com/channel/UCyb-cllCkMREr9de-hoiDrg" target="_blank">Youtube</a>,<a href="https://twitter.com/YamatoIori" target="_blank">Twitter</a>)の非公式ファンサイトです。
            </p>
            <p>
                配信でのコメントを集計し、検索機能や各種データを提供しています。
            </p>
            <p>
                なにかあれば<a href="https://twitter.com/fi_n_o">@fi_n_o</a>か<a href="https://github.com/yaegaki/yamatoiori-kawaii">github</a>に連絡ください。
            </p>
        </section>;
    }

    getContentDescription() {
        return <section>
            <h2>コンテンツ</h2>
            <h3><Link to="/">Video</Link></h3>
            <p>
                これまでの配信および動画の一覧を表示します。<br/>
                一覧画面ではその配信の特徴となる単語で作られたワードクラウドを見ることもできます。<br/>
            </p>
            <p>
                一覧から動画を選択するとその動画の詳細ページに遷移します。<br/>
                詳細ページではその配信の時間ごとによく使われた単語、全体でよく使われた単語、ワードクラウドを見ることができます。<br/>
            </p>
            <h3><Link to="/search">Search</Link></h3>
            <p>
                このサイトのメインコンテンツです。
            </p>
            <p>
                配信内で行われたコメントから配信を検索することができます。<br/>
                この機能を使うことで「あのお話はどの配信で行われたかな」というときにある程度特定することができます。<br/>
            </p>
            <p>
                なお、配信で行われたコメント全てが検索に引っかかる訳ではなく、ある程度絞り込まれたものが引っかかります。<br/>
                もし検索結果に出てこない場合は違う単語を試してみてください。<br/>
            </p>
            <h3><Link to="/history">History</Link></h3>
            <p>
                過去の配信がいつ行われたかを表示します。
            </p>
            <h3><Link to="/other">Other</Link></h3>
            <p>
                上記以外のちょっとしたコンテンツがあります。
            </p>
            <h3><Link to="/about">About</Link></h3>
            <p>
                このページです。
            </p>
        </section>;
    }

    getNotes() {
        return <section>
            <h2>注意事項</h2>
            <p>手動で更新しているので常に最新のデータが表示されているとは限りません。</p>
        </section>;
    }
}