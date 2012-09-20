// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * JavaScript required by the essay question type.
 *
 * @package    qtype
 * @subpackage essay
 * @copyright  2012 Univesity of Wisconsin-Madison
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

M.qtype_essay = M.qtype_essay || {};

M.qtype_essay = {
	count : function (response) {
		var chars = (response.length) ? response.length : 0;
		var words = (chars) ? response.match(/\b/g) : 0;
		words = (words) ? words.length / 2 : 0;
		
		return {'char' : chars, 'word' : words};
	},
	init_editor : function (Y, questiondiv, options) {	
		this.init_options(options);
		
		var qnode  = Y.one(questiondiv);
		var qid    = options.qid;
		
		var editor = tinyMCE.get(options.editorid);
		
		editor.onInit.add(function(editor) {
			var body = editor.getBody();
			
			var node = Y.one(body);
			if (this.block[qid]) {
				node.on('keydown', function (e) {
					var response = tinymce.trim(body.innerText || body.textContent);
					M.qtype_essay.verify_input(e, qid, response);
				});
			}
			node.on('keyup', function (e) {
				var response = tinymce.trim(body.innerText || body.textContent);
				M.qtype_essay.update_count(qnode, qid, response);
			});
		});
	},
	init_options : function (options) {
		var qid = options.qid;
		if (this.climit == null) {
			this.climit = new Array();
		}
		this.climit[qid] = parseInt(options.charlimit);
		if (this.wlimit == null) {
			this.wlimit = new Array();
		}
		this.wlimit[qid] = parseInt(options.wordlimit);
		if (this.block == null) {
			this.block = new Array();
		}
		this.block[qid]  = options.block;
	},
	init_plain : function (Y, questiondiv, options) {
		this.init_options(options);
		
		var qnode = Y.one(questiondiv);
		var qid   = options.qid;
		
		if (this.block[qid]) {
			qnode.on('keydown', function (e) {
				var response = this.one('.qtype_essay_response').get('value');
				M.qtype_essay.verify_input(e, qid, response);
			});
		}
		qnode.on('keyup', function (e) {
			var response = this.one('.qtype_essay_response').get('value');
			M.qtype_essay.update_count(this, qid, response);
		});
	},
	update_count_node : function (countnode, currentcount, limit, block) {
		if (!block) {
			var isOverLimit = countnode.hasClass('overlimit');
		    if (currentcount > limit) {
		    	if (!isOverLimit) {
		    		countnode.addClass('overlimit');
			    	countnode.set('title', M.util.get_string('overlimit_help', 'qtype_essay'));
	    		}
		    } else if (isOverLimit) {
		    	countnode.removeClass('overlimit');
		    	countnode.removeAttribute('title');
		    }
		} else {
			var isAtLimit = countnode.hasClass('atlimit');
			if (currentcount >= limit) {
				if (!isAtLimit) {
					countnode.addClass('atlimit');
					countnode.set('title', M.util.get_string('atlimit_help', 'qtype_essay'));
	    		}
		    } else if (isAtLimit) {
		    	countnode.removeClass('atlimit');
		    	countnode.removeAttribute('title');
		    }
		}
	    countnode.setHTML(currentcount);
	},
	update_count : function (questionnode, qid, response) {
		var count = M.qtype_essay.count(response);
	    
		// Character count
	    var charcountnode = questionnode.one('.charcount .current');
	    if (charcountnode) {
	    	this.update_count_node(charcountnode, count.char, this.climit[qid], this.block[qid]);
	    }
	    // Word count
	    var wordcountnode = questionnode.one('.wordcount .current');
	    if (wordcountnode) {
	    	this.update_count_node(wordcountnode, count.word, this.wlimit[qid], this.block[qid]);
	    }
	},
	verify_input : function (keyevent, qid, response) {
		var count = M.qtype_essay.count(response);
		
		// Count limit tests
		var climit = this.climit[qid];
	    var toomanychars = (climit && ((count.char + 1) > climit));
	    var wlimit = this.wlimit[qid];
	    var toomanywords = (wlimit && ((count.word > wlimit) || ((count.word == wlimit) && spacekey)));
	    
	    if (toomanychars || toomanywords) {
			// Key tests once limit reached
			var arrowkey = (keyevent.button > 36 && keyevent.button < 41);
			var ctrlkey  = (keyevent.ctrlKey || keyevent.metaKey || keyevent.altKey);
		    var delkey   = (keyevent.button == 8 || keyevent.button == 46);
			var spacekey = (keyevent.button == 32);
		    
		    // Event halt criteria
		    if (!arrowkey && !ctrlkey && !delkey) {
		    	keyevent.halt(true);
		    }
	    }
	},
};
