package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"google.golang.org/appengine" // AppEngineライブラリを読み込みます
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/memcache"
	"google.golang.org/appengine/user"
)

type Chat struct {
	Message string
}

type Summary struct {
	// id:title:publishedAt
	Info string
}

const chatKindName = "Chat2"

const utf8LastChar = "\xef\xbf\xbd"

func getSummariesWithCache(w http.ResponseWriter, r *http.Request) {
	ctx := appengine.NewContext(r)

	item, err := memcache.Get(ctx, "summary")
	if err == nil {
		// キャッシュがある場合はそのまま返す
		w.Header().Set("Content-Type", "application/json")
		w.Write(item.Value)
		return
	}

	if err != memcache.ErrCacheMiss {
		// キャッシュミスじゃない場合はやばそうなのでエラー
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	body, err := getSummaries(ctx, w, r)
	if err == nil {
		// 正しくレスポンスを返せた場合のみキャッシュに書き込んでおく
		item = &memcache.Item{
			Key:        "summary",
			Value:      body,
			Expiration: time.Duration(1440) * time.Second,
		}
		memcache.Set(ctx, item)
	}
}

// キャッシュを使わない版のSummaryの取得
// データ更新時などに確実にdatastoreにあるものを取得するために使用する
// adminにしか許可しない
func getSummariesWithoutCache(w http.ResponseWriter, r *http.Request) {
	ctx := appengine.NewContext(r)

	appid := appengine.AppID(ctx)
	// ローカルの時にはappidがNoneになる
	// ローカル以外ではログイン必須にする
	if appid != "None" {
		u := user.Current(ctx)
		if u == nil || !u.Admin {
			http.Error(w, "must need login", http.StatusForbidden)
			return
		}
	}

	getSummaries(ctx, w, r)
}

func getSummaries(ctx context.Context, w http.ResponseWriter, r *http.Request) ([]byte, error) {
	q := datastore.NewQuery("Summary").Project("Info")

	summaries := make([]*Summary, 0)
	if _, err := q.GetAll(ctx, &summaries); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return nil, err
	}

	w.Header().Set("Content-Type", "application/json")
	body, err := json.Marshal(summaries)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return nil, err
	}

	w.Write(body)
	return body, nil
}

func search(w http.ResponseWriter, r *http.Request) {
	ctx := appengine.NewContext(r)

	var (
		qs = r.FormValue("q")
	)

	q := datastore.NewQuery(chatKindName)
	if qs != "" {
		q = q.Filter("Message >=", qs).Filter("Message <=", qs+utf8LastChar)
	}

	q = q.Limit(50).Project("Message")
	chats := make([]*Chat, 0)
	if _, err := q.GetAll(ctx, &chats); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	body, err := json.Marshal(chats)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(body)
}

func login(w http.ResponseWriter, r *http.Request) {
	ctx := appengine.NewContext(r)

	loginUrl, err := user.LoginURL(ctx, "/api/looogin")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, `<div><a href="%s">login</a></div>`, loginUrl)

	// ログアウト用のURL
	// ログインアウト後ユーザーを引数で渡したURLへリダイレクト
	logoutUrl, err := user.LogoutURL(ctx, "/api/looogin")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, `<div><a href="%s">logout</a></div>`, logoutUrl)
	return
}

func register_summary(w http.ResponseWriter, r *http.Request) {
	ctx := appengine.NewContext(r)

	appid := appengine.AppID(ctx)
	// ローカルの時にはappidがNoneになる
	// ローカル以外ではログイン必須にする
	if appid != "None" {
		u := user.Current(ctx)
		if u == nil || !u.Admin {
			http.Error(w, "must need login", http.StatusForbidden)
			return
		}
	}

	dataStr := r.FormValue("data")
	allLines := strings.Split(dataStr, "\n")

	summaries := make([]Summary, len(allLines))
	index := 0
	for _, line := range allLines {
		if line == "" {
			continue
		}

		summaries[index].Info = line
		index++
	}
	summaries = summaries[:index]

	keys := make([]*datastore.Key, index)

	for i := range keys {
		keys[i] = datastore.NewIncompleteKey(ctx, "Summary", nil)
	}

	if _, err := datastore.PutMulti(ctx, keys, summaries); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// キャッシュを消す
	// エラーが出ても特にできることがないので無視
	memcache.Delete(ctx, "summary")

	fmt.Fprintf(w, `<div>%v registerd.</div>`, index)
}

func register_chat(w http.ResponseWriter, r *http.Request) {
	ctx := appengine.NewContext(r)

	appid := appengine.AppID(ctx)
	// ローカルの時にはappidがNoneになる
	// ローカル以外ではログイン必須にする
	if appid != "None" {
		u := user.Current(ctx)
		if u == nil || !u.Admin {
			http.Error(w, "must need login", http.StatusForbidden)
			return
		}
	}

	dataStr := r.FormValue("data")
	allLines := strings.Split(dataStr, "\n")

	chats := make([]Chat, len(allLines))
	index := 0
	for _, line := range allLines {
		if line == "" {
			continue
		}

		chats[index].Message = line
		index++
	}
	chats = chats[:index]

	keys := make([]*datastore.Key, len(chats))

	for i := range keys {
		keys[i] = datastore.NewIncompleteKey(ctx, chatKindName, nil)
	}

	if _, err := datastore.PutMulti(ctx, keys, chats); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, `<div>%v registerd.</div>`, index)
}

func main() {
	http.HandleFunc("/api/summary", getSummariesWithCache)
	http.HandleFunc("/api/search", search)

	http.HandleFunc("/api/looogin", login)

	http.HandleFunc("/api/summary_without_cache", getSummariesWithoutCache)
	http.HandleFunc("/api/register_summary", register_summary)
	http.HandleFunc("/api/register_chat", register_chat)
	appengine.Main()
}
