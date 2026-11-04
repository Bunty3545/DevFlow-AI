import { User, IUser } from './User';
import { Project, IProject } from './Project';
import { Milestone, IMilestone } from './Milestone';
import { Issue, IIssue } from './Issue';
import { Expenditure, IExpenditure } from './Expenditure';
import { ProjectUpdate, IProjectUpdate } from './ProjectUpdate';
import { ActivityLog, IActivityLog } from './ActivityLog';
import { Notification, INotification } from './Notification';
import { isMemoryMode, memoryStore, generateId } from '../config/memoryStore';
import bcrypt from 'bcryptjs';

// Deep clone helper
const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const UserRepo = {
  async countDocuments(filter: any = {}): Promise<number> {
    if (!isMemoryMode) return User.countDocuments(filter);
    return memoryStore.users.length;
  },

  async find(filter: any = {}): Promise<IUser[]> {
    if (!isMemoryMode) return User.find(filter).select('-password');
    return memoryStore.users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
  },

  async findOne(filter: any): Promise<IUser | null> {
    if (!isMemoryMode) return User.findOne(filter);
    let user: any = null;
    if (filter.email) {
      user = memoryStore.users.find(u => u.email.toLowerCase() === filter.email.toLowerCase());
    } else if (filter._id) {
      user = memoryStore.users.find(u => u._id.toString() === filter._id.toString());
    }
    if (!user) return null;
    return {
      ...user,
      comparePassword: async (candidate: string) => bcrypt.compare(candidate, user.password),
      save: async function() {
        const idx = memoryStore.users.findIndex(u => u._id.toString() === this._id.toString());
        if (idx !== -1) memoryStore.users[idx] = { ...this };
        return this;
      }
    } as any;
  },

  async findById(id: string): Promise<IUser | null> {
    return this.findOne({ _id: id });
  },

  async create(data: any): Promise<IUser> {
    if (!isMemoryMode) return User.create(data);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const doc: any = {
      _id: generateId(),
      ...data,
      password: hashedPassword,
      isActive: data.isActive ?? true,
      assignedProjects: data.assignedProjects || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.users.push(doc);
    return {
      ...doc,
      comparePassword: async (candidate: string) => bcrypt.compare(candidate, hashedPassword),
      save: async function() {
        const idx = memoryStore.users.findIndex(u => u._id.toString() === this._id.toString());
        if (idx !== -1) memoryStore.users[idx] = { ...this };
        return this;
      }
    } as any;
  },

  async findByIdAndDelete(id: string): Promise<boolean> {
    if (!isMemoryMode) {
      const res = await User.findByIdAndDelete(id);
      return !!res;
    }
    const idx = memoryStore.users.findIndex(u => u._id.toString() === id.toString());
    if (idx !== -1) {
      memoryStore.users.splice(idx, 1);
      return true;
    }
    return false;
  }
};

export const ProjectRepo = {
  async countDocuments(filter: any = {}): Promise<number> {
    if (!isMemoryMode) return Project.countDocuments(filter);
    return this.applyFilter(filter).length;
  },

  applyFilter(filter: any = {}): any[] {
    let list = [...memoryStore.projects];
    if (filter.projectId) {
      if (typeof filter.projectId === 'string') {
        list = list.filter(p => p.projectId.toUpperCase() === filter.projectId.toUpperCase());
      } else if (filter.projectId.$in) {
        list = list.filter(p => filter.projectId.$in.includes(p.projectId));
      }
    }
    if (filter.sector && filter.sector !== 'All') list = list.filter(p => p.sector === filter.sector);
    if (filter.ministry && filter.ministry !== 'All') list = list.filter(p => p.ministry === filter.ministry);
    if (filter.state && filter.state !== 'All') list = list.filter(p => p.state === filter.state);
    if (filter.riskLevel && filter.riskLevel !== 'All') list = list.filter(p => p.riskLevel === filter.riskLevel);
    if (filter.status && filter.status !== 'All') list = list.filter(p => p.status === filter.status);

    if (filter.$or) {
      list = list.filter(p => {
        return filter.$or.some((cond: any) => {
          if (cond.name?.$regex) return new RegExp(cond.name.$regex, 'i').test(p.name);
          if (cond.projectId?.$regex) return new RegExp(cond.projectId.$regex, 'i').test(p.projectId);
          if (cond.district?.$regex) return new RegExp(cond.district.$regex, 'i').test(p.district);
          if (cond.implementingAgency?.$regex) return new RegExp(cond.implementingAgency.$regex, 'i').test(p.implementingAgency);
          return false;
        });
      });
    }
    return list;
  },

  async find(filter: any = {}, options: any = {}): Promise<IProject[]> {
    if (!isMemoryMode) {
      let q = Project.find(filter);
      if (options.sort) q = q.sort(options.sort);
      if (options.skip) q = q.skip(options.skip);
      if (options.limit) q = q.limit(options.limit);
      return q;
    }
    let list = this.applyFilter(filter);
    if (options.sort) {
      const key = Object.keys(options.sort)[0];
      const dir = options.sort[key];
      list.sort((a, b) => (a[key] > b[key] ? dir : -dir));
    }
    if (options.skip) list = list.slice(options.skip);
    if (options.limit) list = list.slice(0, options.limit);
    return list.map(item => this.wrap(item));
  },

  wrap(item: any): any {
    if (!item) return null;
    return {
      ...item,
      toObject: () => clone(item),
      save: async function() {
        const idx = memoryStore.projects.findIndex(p => p.projectId === this.projectId);
        if (idx !== -1) memoryStore.projects[idx] = { ...this };
        return this;
      }
    };
  },

  async findOne(filter: any): Promise<IProject | null> {
    if (!isMemoryMode) return Project.findOne(filter);
    let item: any = null;
    if (filter.projectId) {
      item = memoryStore.projects.find(p => p.projectId.toUpperCase() === filter.projectId.toUpperCase());
    } else if (filter._id) {
      item = memoryStore.projects.find(p => p._id.toString() === filter._id.toString());
    } else if (filter.$or) {
      for (const cond of filter.$or) {
        if (cond.projectId) {
          item = memoryStore.projects.find(p => p.projectId.toUpperCase() === cond.projectId.toUpperCase());
          if (item) break;
        }
        if (cond._id) {
          item = memoryStore.projects.find(p => p._id.toString() === cond._id.toString());
          if (item) break;
        }
      }
    }
    return this.wrap(item);
  },

  async create(data: any): Promise<IProject> {
    if (!isMemoryMode) return Project.create(data);
    const doc: any = {
      _id: generateId(),
      ...data,
      projectId: data.projectId.toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdated: new Date()
    };
    memoryStore.projects.push(doc);
    return this.wrap(doc);
  },

  async insertMany(items: any[]): Promise<any> {
    if (!isMemoryMode) return Project.insertMany(items);
    items.forEach(item => {
      memoryStore.projects.push({
        _id: generateId(),
        ...item,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUpdated: new Date()
      });
    });
    return items;
  },

  async findOneAndDelete(filter: any): Promise<any> {
    if (!isMemoryMode) return Project.findOneAndDelete(filter);
    const item = await this.findOne(filter);
    if (!item) return null;
    const idx = memoryStore.projects.findIndex(p => p.projectId === item.projectId);
    if (idx !== -1) memoryStore.projects.splice(idx, 1);
    return item;
  }
};

export const MilestoneRepo = {
  async find(filter: any = {}): Promise<IMilestone[]> {
    if (!isMemoryMode) return Milestone.find(filter).sort({ sequence: 1 });
    let list = [...memoryStore.milestones];
    if (filter.projectId) {
      list = list.filter(m => m.projectId.toUpperCase() === filter.projectId.toUpperCase());
    }
    if (filter.status) list = list.filter(m => m.status === filter.status);
    list.sort((a, b) => a.sequence - b.sequence);
    return list.map(m => ({
      ...m,
      save: async function() {
        const idx = memoryStore.milestones.findIndex(item => item._id === this._id);
        if (idx !== -1) memoryStore.milestones[idx] = { ...this };
        return this;
      }
    })) as any;
  },

  async findById(id: string): Promise<any> {
    if (!isMemoryMode) return Milestone.findById(id);
    const m = memoryStore.milestones.find(item => item._id.toString() === id.toString());
    if (!m) return null;
    return {
      ...m,
      save: async function() {
        const idx = memoryStore.milestones.findIndex(item => item._id === this._id);
        if (idx !== -1) memoryStore.milestones[idx] = { ...this };
        return this;
      }
    };
  },

  async create(data: any): Promise<any> {
    if (!isMemoryMode) return Milestone.create(data);
    const doc = { _id: generateId(), ...data, createdAt: new Date(), updatedAt: new Date() };
    memoryStore.milestones.push(doc);
    return doc;
  },

  async insertMany(items: any[]): Promise<any> {
    if (!isMemoryMode) return Milestone.insertMany(items);
    items.forEach(it => memoryStore.milestones.push({ _id: generateId(), ...it, createdAt: new Date() }));
    return items;
  },

  async deleteMany(filter: any): Promise<any> {
    if (!isMemoryMode) return Milestone.deleteMany(filter);
    if (filter.projectId) {
      memoryStore.milestones = memoryStore.milestones.filter(m => m.projectId !== filter.projectId);
    }
  }
};

export const IssueRepo = {
  async countDocuments(filter: any = {}): Promise<number> {
    if (!isMemoryMode) return Issue.countDocuments(filter);
    return memoryStore.issues.length;
  },

  async find(filter: any = {}): Promise<any[]> {
    if (!isMemoryMode) return Issue.find(filter).sort({ createdAt: -1 });
    let list = [...memoryStore.issues];
    if (filter.projectId) list = list.filter(i => i.projectId.toUpperCase() === filter.projectId.toUpperCase());
    if (filter.severity && filter.severity !== 'All') list = list.filter(i => i.severity === filter.severity);
    if (filter.status) {
      if (filter.status.$ne) list = list.filter(i => i.status !== filter.status.$ne);
      else if (filter.status !== 'All') list = list.filter(i => i.status === filter.status);
    }
    if (filter.category && filter.category !== 'All') list = list.filter(i => i.category === filter.category);
    return list.map(i => ({
      ...i,
      toObject: () => clone(i),
      save: async function() {
        const idx = memoryStore.issues.findIndex(item => item.issueId === this.issueId);
        if (idx !== -1) memoryStore.issues[idx] = { ...this };
        return this;
      }
    }));
  },

  async findOne(filter: any): Promise<any> {
    if (!isMemoryMode) return Issue.findOne(filter);
    let item: any = null;
    if (filter.issueId) {
      item = memoryStore.issues.find(i => i.issueId.toUpperCase() === filter.issueId.toUpperCase());
    } else if (filter._id) {
      item = memoryStore.issues.find(i => i._id.toString() === filter._id.toString());
    } else if (filter.$or) {
      for (const cond of filter.$or) {
        if (cond.issueId) {
          item = memoryStore.issues.find(i => i.issueId.toUpperCase() === cond.issueId.toUpperCase());
          if (item) break;
        }
        if (cond._id) {
          item = memoryStore.issues.find(i => i._id.toString() === cond._id.toString());
          if (item) break;
        }
      }
    }
    if (!item) return null;
    return {
      ...item,
      save: async function() {
        const idx = memoryStore.issues.findIndex(it => it.issueId === this.issueId);
        if (idx !== -1) memoryStore.issues[idx] = { ...this };
        return this;
      }
    };
  },

  async create(data: any): Promise<any> {
    if (!isMemoryMode) return Issue.create(data);
    const doc = { _id: generateId(), ...data, createdAt: new Date(), updatedAt: new Date() };
    memoryStore.issues.push(doc);
    return doc;
  },

  async insertMany(items: any[]): Promise<any> {
    if (!isMemoryMode) return Issue.insertMany(items);
    items.forEach(it => memoryStore.issues.push({ _id: generateId(), ...it, createdAt: new Date() }));
    return items;
  },

  async deleteMany(filter: any): Promise<any> {
    if (!isMemoryMode) return Issue.deleteMany(filter);
    if (filter.projectId) {
      memoryStore.issues = memoryStore.issues.filter(i => i.projectId !== filter.projectId);
    }
  }
};

export const ExpenditureRepo = {
  async find(filter: any = {}): Promise<any[]> {
    if (!isMemoryMode) return Expenditure.find(filter).sort({ date: -1 });
    let list = [...memoryStore.expenditures];
    if (filter.projectId) list = list.filter(e => e.projectId.toUpperCase() === filter.projectId.toUpperCase());
    return list;
  },

  async create(data: any): Promise<any> {
    if (!isMemoryMode) return Expenditure.create(data);
    const doc = { _id: generateId(), ...data, createdAt: new Date() };
    memoryStore.expenditures.push(doc);
    return doc;
  },

  async insertMany(items: any[]): Promise<any> {
    if (!isMemoryMode) return Expenditure.insertMany(items);
    items.forEach(it => memoryStore.expenditures.push({ _id: generateId(), ...it, createdAt: new Date() }));
    return items;
  }
};

export const ProjectUpdateRepo = {
  async find(filter: any = {}): Promise<any[]> {
    if (!isMemoryMode) return ProjectUpdate.find(filter).sort({ updateDate: -1 });
    let list = [...memoryStore.projectUpdates];
    if (filter.projectId) list = list.filter(u => u.projectId.toUpperCase() === filter.projectId.toUpperCase());
    return list.map(u => ({
      ...u,
      save: async function() {
        const idx = memoryStore.projectUpdates.findIndex(item => item._id === this._id);
        if (idx !== -1) memoryStore.projectUpdates[idx] = { ...this };
        return this;
      }
    }));
  },

  async findById(id: string): Promise<any> {
    if (!isMemoryMode) return ProjectUpdate.findById(id);
    const u = memoryStore.projectUpdates.find(it => it._id.toString() === id.toString());
    if (!u) return null;
    return {
      ...u,
      save: async function() {
        const idx = memoryStore.projectUpdates.findIndex(item => item._id === this._id);
        if (idx !== -1) memoryStore.projectUpdates[idx] = { ...this };
        return this;
      }
    };
  },

  async create(data: any): Promise<any> {
    if (!isMemoryMode) return ProjectUpdate.create(data);
    const doc = { _id: generateId(), ...data, createdAt: new Date(), updatedAt: new Date() };
    memoryStore.projectUpdates.push(doc);
    return doc;
  }
};

export const ActivityLogRepo = {
  async find(): Promise<any[]> {
    if (!isMemoryMode) return ActivityLog.find().sort({ timestamp: -1 }).limit(10);
    return [...memoryStore.activityLogs].slice(-10).reverse();
  },

  async create(data: any): Promise<any> {
    if (!isMemoryMode) return ActivityLog.create(data);
    const doc = { _id: generateId(), ...data, timestamp: new Date() };
    memoryStore.activityLogs.push(doc);
    return doc;
  }
};

export const NotificationRepo = {
  async create(data: any): Promise<any> {
    if (!isMemoryMode) return Notification.create(data);
    const doc = { _id: generateId(), ...data, createdAt: new Date(), isRead: false };
    memoryStore.notifications.push(doc);
    return doc;
  }
};

