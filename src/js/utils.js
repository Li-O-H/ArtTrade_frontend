const serverPath = 'http://localhost:8081'

export const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.slice(reader.result.indexOf(',') + 1));
    reader.onerror = reject;
});

export function signup(context) {
    const that = context;
    let json = JSON.stringify({
        password: that.password,
        aboutCreator: that.aboutCreator,
        city: that.city,
        email: that.email,
        name: that.userName
    });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverPath + '/auth/signup', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.token = xhr.response.toString()
            localStorage.setItem('token', xhr.response.toString());
            that.isSignup = false;
            getUserByToken(that)
        }
    };
}

export function signin(context) {
    const that = context;
    let json = JSON.stringify({email: that.email, password: that.password});
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverPath + '/auth/login', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.isSignin = false;
            localStorage.setItem('token', xhr.response.toString());
            getUserByToken(that)
        }
    };
}

export function getUserByToken(context) {
    if (localStorage.getItem("token") === null) {
        return
    }
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + "/auth/")
    url.searchParams.set("token", localStorage.getItem("token"))
    xhr.open("GET", url, true)
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
            localStorage.removeItem("token")
        } else {
            that.user = JSON.parse(xhr.response)
        }
    };
}

export function getSelectedUser(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + "/api/user/" + that.selectedUserId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.selectedUser = JSON.parse(xhr.response)
        }
    };
}

export function modifyUser(context) {
    const that = context;
    let json = JSON.stringify({
        id: that.selectedUser.id,
        name: that.modifyUserName,
        city: that.modifyUserCity,
        aboutCreator: that.modifyUserAboutCreator,
    });
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/user', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = async function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            for (const file of that.photos) {
                postUserPhoto(this, that.selectedUser.id, await toBase64(file))
            }
            for (const photo of that.photosForDeletion) {
                deleteUserPhoto(photo)
            }
            that.isModifyUser = false
            that.photos = []
            that.photosForDeletion = []
            getSelectedUser(context)
        }
    };
}

export function deleteUser(id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/user/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            location.reload()
        }
    };
}

export function postUserPhoto(context, userId, file) {
    let json = JSON.stringify({
        userId: userId,
        photo: file
    });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverPath + '/api/userPhoto', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        }
    };
}

export function deleteUserPhoto(id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/userPhoto/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        }
    };
}

export function getUserPhotosByUser(context, userId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/userPhoto')
    url.searchParams.set('userId', userId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.savedPhotos = JSON.parse(xhr.response)
        }
    };
}

export function getItemFeedbacksByUser(context, userId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/itemFeedback')
    url.searchParams.set('userId', userId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.feedbacks = JSON.parse(xhr.response)
        }
    };
}

export function getItemBidsByUser(context, userId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/itemBid')
    url.searchParams.set('userId', userId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.bids = JSON.parse(xhr.response)
        }
    };
}

export function getOrderFeedbacksByUser(context, userId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/orderFeedback')
    url.searchParams.set('userId', userId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.feedbacks = JSON.parse(xhr.response)
        }
    };
}

export function getOrderBidsByUser(context, userId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/orderBid')
    url.searchParams.set('userId', userId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.bids = JSON.parse(xhr.response)
        }
    };
}

export function getAllCategories(context) {
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + "/api/category")
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            let categories = JSON.parse(xhr.response)
            context.categories = []
            categories.forEach(function (category) {
                context.categories.push({
                    value: category.id,
                    text: category.name
                })
            })
        }
    };
}

export function getItems(context, id) {
    const that = context;
    let isId = id !== undefined
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/item')
    if (isId) {
        url += '/' + id
    } else {
        if (that.maxPrice !== undefined) {
            url.searchParams.set('maxPrice', that.maxPrice)
        }
        if (that.minPrice !== undefined) {
            url.searchParams.set('minPrice', that.minPrice)
        }
        if (that.selectedUserId !== undefined) {
            url.searchParams.set('userId', that.selectedUserId)
        }
        if (that.favoriteByUserId !== undefined) {
            url.searchParams.set('favoriteByUserId', that.favoriteByUserId)
        }
        if (that.searchItemsCategory !== undefined) {
            url.searchParams.set('categoryId', that.searchItemsCategory)
        }
    }
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
            that.items = []
        } else {
            let json = JSON.parse(xhr.response)
            if (!isId) {
                that.items = json
            } else {
                that.curItem = json
            }
        }
    };
}

export function getBidsByItem(context, itemId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/itemBid/item')
    url.searchParams.set('itemId', itemId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.bids = JSON.parse(xhr.response)
        }
    };
}

export function getFeedbacksByItem(context, itemId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/itemFeedback/item')
    url.searchParams.set('itemId', itemId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.feedbacks = JSON.parse(xhr.response)
        }
    };
}

export function getBidsByOrder(context, orderId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/orderBid/order')
    url.searchParams.set('orderId', orderId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.bids = JSON.parse(xhr.response)
        }
    };
}

export function getFeedbacksByOrder(context, orderId) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/orderFeedback/order')
    url.searchParams.set('orderId', orderId)
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.feedbacks = JSON.parse(xhr.response)
        }
    };
}

export function postItem(context) {
    const that = context;
    let json = JSON.stringify({
        title: that.addItemTitle,
        categoryId: that.addItemCategory,
        description: that.addItemDescription,
        userId: that.user.id
    });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverPath + '/api/item', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = async function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            for (const file of that.photos) {
                postItemPhoto(this, JSON.parse(xhr.response).id, await toBase64(file))
            }
            that.isAddItem = false
            that.photos = []
        }
    };
}

export function modifyItem(context) {
    const that = context;
    let json = JSON.stringify({
        id: that.curItem.id,
        title: that.modifyItemTitle,
        categoryId: that.modifyItemCategory,
        description: that.modifyItemDescription,
    });
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/item', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = async function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            for (const file of that.photos) {
                postItemPhoto(this, that.curItem.id, await toBase64(file))
            }
            for (const photo of that.photosForDeletion) {
                deleteItemPhoto(photo)
            }
            that.isModifyItem = false
            that.photos = []
            that.photosForDeletion = []
            getItems(context, that.curItem.id)
        }
    };
}

export function postItemPhoto(context, itemId, file) {
    let json = JSON.stringify({
        itemId: itemId,
        photo: file
    });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverPath + '/api/itemPhoto', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        }
    };
}

export function postItemFeedback(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let json = JSON.stringify({
        rating: that.ratingSelected,
        text: that.feedbackText,
        itemId: that.curItem.id,
        userId: that.user.id
    })
    xhr.open("POST", serverPath + '/api/itemFeedback', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.isAddFeedback = false
            getFeedbacksByItem(context, that.curItem.id)
        }
    };
}

export function postItemBid(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let json = JSON.stringify({
        price: parseFloat(that.bidSize).toFixed(2),
        itemId: that.curItem.id,
        userId: that.user.id
    })
    xhr.open("POST", serverPath + '/api/itemBid', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.isAddBid = false
            getBidsByItem(context, that.curItem.id)
        }
    };
}

export function deleteItem(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/item/' + that.curItem.id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.curItem = undefined
            that.id = undefined
        }
    };
}

export function deleteItemPhoto(id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/itemPhoto/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        }
    };
}

export function deleteItemFeedback(context, id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/itemFeedback/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            if (context.curItem === undefined) {
                getItemFeedbacksByUser(context, context.selectedUserId)
            } else {
                getFeedbacksByItem(context, context.curItem.id)
            }
        }
    };
}

export function deleteItemBid(context, id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/itemBid/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            if (context.curItem === undefined) {
                getItemBidsByUser(context, context.selectedUserId)
            } else {
                getBidsByItem(context, context.curItem.id)
            }
        }
    };
}

export function activateItem(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/item/' + that.curItem.id + '/activate', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getItems(context, that.curItem.id)
        }
    };
}

export function hideItem(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/item/' + that.curItem.id + '/hide', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getItems(context, that.curItem.id)
        }
    };
}

export function completeItem(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/item/' + that.curItem.id + '/complete', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getItems(context, that.curItem.id)
        }
    };
}

export function addItemToFavorite(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/item/favorite');
    url.searchParams.set('userId', that.user.id)
    url.searchParams.set('itemId', that.curItem.id)
    xhr.open("POST", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getItems(context, that.curItem.id)
        }
    };
}

export function removeItemFromFavorite(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/item/favorite');
    url.searchParams.set('userId', that.user.id)
    url.searchParams.set('itemId', that.curItem.id)
    xhr.open("DELETE", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getItems(context, that.curItem.id)
        }
    };
}

export function getOrders(context, id) {
    const that = context;
    let isId = id !== undefined
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/order')
    if (isId) {
        url += '/' + id
    } else {
        if (that.maxPrice !== undefined) {
            url.searchParams.set('maxPrice', that.maxPrice)
        }
        if (that.minPrice !== undefined) {
            url.searchParams.set('minPrice', that.minPrice)
        }
        if (that.selectedUserId !== undefined) {
            url.searchParams.set('userId', that.selectedUserId)
        }
        if (that.favoriteByUserId !== undefined) {
            url.searchParams.set('favoriteByUserId', that.favoriteByUserId)
        }
        if (that.doneByUserId !== undefined) {
            url.searchParams.set('doneByUserId', that.doneByUserId)
        }
        if (that.searchOrdersCategory !== undefined) {
            url.searchParams.set('categoryId', that.searchOrdersCategory)
        }
    }
    xhr.open("GET", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
            that.orders = []
        } else {
            let json = JSON.parse(xhr.response)
            if (!isId) {
                that.orders = json
            } else {
                that.curOrder = json
            }
        }
    };
}

export function postOrder(context) {
    const that = context;
    let json = JSON.stringify({
        title: that.addOrderTitle,
        categoryId: that.addOrderCategory,
        description: that.addOrderDescription,
        userId: that.user.id,
        deadline: that.addOrderDeadline
    });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverPath + '/api/order', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = async function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            for (const file of that.photos) {
                postOrderPhoto(this, JSON.parse(xhr.response).id, await toBase64(file))
            }
            that.isAddOrder = false
            that.photos = []
        }
    };
}

export function modifyOrder(context) {
    const that = context;
    let json = JSON.stringify({
        id: that.curOrder.id,
        title: that.modifyOrderTitle,
        categoryId: that.modifyOrderCategory,
        description: that.modifyOrderDescription,
        deadline: that.modifyOrderDeadline
    });
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/order', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = async function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            for (const file of that.photos) {
                postOrderPhoto(this, that.curOrder.id, await toBase64(file))
            }
            for (const photo of that.photosForDeletion) {
                deleteOrderPhoto(photo)
            }
            that.isModifyOrder = false
            that.photos = []
            that.photosForDeletion = []
            getOrders(context, that.curOrder.id)
        }
    };
}

export function postOrderPhoto(context, orderId, file) {
    let json = JSON.stringify({
        orderId: orderId,
        photo: file
    });
    const xhr = new XMLHttpRequest();
    xhr.open("POST", serverPath + '/api/orderPhoto', true)
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        }
    };
}

export function postOrderFeedback(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let json = JSON.stringify({
        rating: that.ratingSelected,
        text: that.feedbackText,
        orderId: that.curOrder.id,
        userId: that.user.id
    })
    xhr.open("POST", serverPath + '/api/orderFeedback', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.isAddFeedback = false
            getFeedbacksByOrder(context, that.curOrder.id)
        }
    };
}

export function postOrderBid(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let json = JSON.stringify({
        price: parseFloat(that.bidSize).toFixed(2),
        orderId: that.curOrder.id,
        userId: that.user.id
    })
    xhr.open("POST", serverPath + '/api/orderBid', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send(json)
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.isAddBid = false
            getBidsByOrder(context, that.curOrder.id)
        }
    };
}

export function deleteOrder(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/order/' + that.curOrder.id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.curOrder = undefined
            that.id = undefined
        }
    };
}

export function deleteOrderPhoto(id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/orderPhoto/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        }
    };
}

export function deleteOrderFeedback(context, id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/orderFeedback/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            if (context.curOrder === undefined) {
                getOrderFeedbacksByUser(context, context.selectedUserId)
            } else {
                getFeedbacksByOrder(context, context.curOrder.id)
            }
        }
    };
}

export function deleteOrderBid(context, id) {
    const xhr = new XMLHttpRequest();
    xhr.open("DELETE", serverPath + '/api/orderBid/' + id, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            if (context.curOrder === undefined) {
                getOrderBidsByUser(context, context.selectedUserId)
            } else {
                getBidsByOrder(context, context.curOrder.id)
            }
        }
    };
}

export function activateOrder(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/order/' + that.curOrder.id + '/activate', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getOrders(context, that.curOrder.id)
        }
    };
}

export function hideOrder(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", serverPath + '/api/order/' + that.curOrder.id + '/hide', true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getOrders(context, that.curOrder.id)
        }
    };
}

export function completeOrder(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/order/' + that.curOrder.id + '/complete')
    if (that.completeOrderEmail !== undefined) {
        url.searchParams.set('email', that.completeOrderEmail)
    }
    xhr.open("PUT", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            that.isCompleteOrder = false
            getOrders(context, that.curOrder.id)
        }
    };
}

export function addOrderToFavorite(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/order/favorite');
    url.searchParams.set('userId', that.user.id)
    url.searchParams.set('orderId', that.curOrder.id)
    xhr.open("POST", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getOrders(context, that.curOrder.id)
        }
    };
}

export function removeOrderFromFavorite(context) {
    const that = context;
    const xhr = new XMLHttpRequest();
    let url = new URL(serverPath + '/api/order/favorite');
    url.searchParams.set('userId', that.user.id)
    url.searchParams.set('orderId', that.curOrder.id)
    xhr.open("DELETE", url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem("token"));
    xhr.send()
    xhr.onload = function () {
        if (xhr.status !== 200) {
            alert(`Ошибка ${xhr.status}: ${JSON.parse(xhr.responseText).message}`);
        } else {
            getOrders(context, that.curOrder.id)
        }
    };
}